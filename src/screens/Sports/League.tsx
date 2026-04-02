import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { View, Text, TouchableOpacity, RefreshControl, StatusBar, Dimensions, ActivityIndicator, Platform } from 'react-native'
import colors from '../../colors';
import { RouteProp, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation';
import { Extrapolation, interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated'
import { GameCard } from '../Sports/components/GameCard';
import { gameType } from '../../types/Games';
import DynamicStickHeader from './components/DynamicStickHeader';
import DynamicTabs from './components/DynamicTabs';
import Standings from './components/Standings';
import LeagueBanner from './components/LeagueBanner';
import useSWR from 'swr';
import { useAuthContext } from '../../contexts/AuthContext';
import { RawInputRecord, school } from '.';
import { getScores, ScoresParams } from './components/fetchers/master';
import { convertFullDateToISO, getLeagueId } from './Team';
import { FlashList } from '@shopify/flash-list';
import Svg, { Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

// --- Types ---
export type groupedGameStatus = {
    title: string;
    data: gameType[];
}
type GameRouteProp = RouteProp<HomeStackParamList, 'League'>;

interface MyFlatListProps {
    data: groupedGameStatus[] | null;
    teamName: school;
    componentItems?: React.ReactElement[];
    HeaderComponent?: React.ComponentType<any>;
    pageIndex: number;
    theme: 'light' | 'dark';
    mainScrollY: Animated.SharedValue<number>;
    currentActivePageIndex: Animated.SharedValue<number>;
    flatListRefs: React.MutableRefObject<Map<number, any>>;
    syncTabs: (index: number, scrollY: number) => void;
    onRefreshRequest: () => Promise<any>;
}

// Intercept type to include sorting timestamp without muddying original gameType
interface ProcessedGame extends gameType {
    _sortTimestamp: number;
}

// Hoist Regex outside the loop for massive performance boost
const REGEX_YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_MMM_DD = /^[A-Za-z]{3}\s\d{1,2}$/;
const CURRENT_YEAR = new Date().getFullYear();

// --- Static Data Processor ---
const groupedDataByStatus = (data: RawInputRecord[]): groupedGameStatus[] => {
    if (!data || data.length === 0) return [];

    const transformedGames: ProcessedGame[] = data.map(record => {
        let formattedDate: string | undefined = undefined;
        let sortTimestamp = 0;

        const myScore = record.schools[0] ? record.scores.home : record.scores.visitor;
        const opponentScore = record.schools[0] ? record.scores.visitor : record.scores.home;
        let wldStatus = "D";
        if (myScore && opponentScore) {
            if (myScore > opponentScore) wldStatus = "W";
            if (myScore < opponentScore) wldStatus = "L";
        }

        return {
            date: record.date,
            league: record.league || 'Unknown League',
            location: record.location,
            notes: record.notes,
            time: record.time,
            home: { name: record.schools[0] || 'Home Team', score: record.scores.home },
            visitor: { name: record.schools[1] || 'Visitor Team', score: record.scores.visitor },
            sets: record.sets ? { home: record.sets.home, visitor: record.sets.visitor } : undefined,
            _sortTimestamp: sortTimestamp // Store here temporarily
        };
    });

    const upcomingGames: ProcessedGame[] = [];
    const pastGames: ProcessedGame[] = [];

    transformedGames.forEach(game => {
        const hasScores = game.home.score !== null && game.visitor.score !== null;
        const isPending = game.time?.toLowerCase().includes('pending') ?? false;
        if (hasScores || isPending) {
            pastGames.push(game);
        } else {
            upcomingGames.push(game);
        }
    });

    // O(1) comparison sort! No more generating Date objects in a loop.
    upcomingGames.sort((a, b) => {
        const valA = a._sortTimestamp || Infinity;
        const valB = b._sortTimestamp || Infinity;
        return valA - valB; // Ascending
    });

    pastGames.sort((a, b) => {
        const valA = a._sortTimestamp || 0;
        const valB = b._sortTimestamp || 0;
        return valB - valA; // Descending
    });

    const groupedData: groupedGameStatus[] = [];
    if (upcomingGames.length > 0) groupedData.push({ title: "Upcoming Games", data: upcomingGames });
    if (pastGames.length > 0) groupedData.push({ title: "Past Games", data: pastGames });

    return groupedData;
};

const CardHeader = React.memo(({ title, theme }: { title: string, theme: "light" | "dark" }) => (
    <View style={{
        marginTop: 16,
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center'
    }}>
        <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Bold', fontSize: 18, color: colors.text[theme].primary }}>
            {title}
        </Text>
    </View>
));

const MyFlatList = React.memo(({
    data,
    theme,
    componentItems,
    HeaderComponent,
    pageIndex,
    mainScrollY,
    currentActivePageIndex,
    flatListRefs,
    syncTabs,
    onRefreshRequest,
}: MyFlatListProps) => {
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (currentActivePageIndex.value === pageIndex) {
                mainScrollY.value = Math.max(0, event.contentOffset.y);
            }
        },
        onEndDrag: (event) => {
            if (currentActivePageIndex.value === pageIndex) {
                runOnJS(syncTabs)(pageIndex, Math.max(0, event.contentOffset.y));
            }
        },
        onMomentumEnd: (event) => {
            if (currentActivePageIndex.value === pageIndex) {
                runOnJS(syncTabs)(pageIndex, Math.max(0, event.contentOffset.y));
            }
        }
    });

    const EmptyBoxIcon = React.memo(({ color }: { color: string }) => (
        <View style={{ transform: [{ scale: 0.6 }] }}>
            <Svg height={78} width={78}>
                <Path d="M66.3779 0C72.5205 0.000331843 77.5 4.98036 77.5 11.123V47.7197C77.4999 53.8624 72.5205 58.8424 66.3779 58.8428H11.123C4.9802 58.8428 7.30663e-05 53.8626 0 47.7197V11.123C0 4.98016 4.98016 0 11.123 0H66.3779ZM11.123 5.02344C7.75437 5.02344 5.02344 7.75437 5.02344 11.123V17.2217H11.8408C14.0202 17.222 15.7869 18.9896 15.7871 21.1689V38.3906C15.7871 40.5702 14.0203 42.3376 11.8408 42.3379H5.02344V47.7197C5.02351 51.0883 7.75441 53.8193 11.123 53.8193H36.2383V42.8232C29.9085 41.6442 25.1155 36.0934 25.1152 29.4219C25.1152 22.7501 29.9082 17.1977 36.2383 16.0186V5.02344H11.123ZM41.2617 16.0186C47.5918 17.1975 52.3838 22.75 52.3838 29.4219C52.3835 36.0935 47.5916 41.6444 41.2617 42.8232V53.8193H66.3779C69.7463 53.819 72.4765 51.0881 72.4766 47.7197V42.3379H65.6602C63.4804 42.3379 61.7129 40.5704 61.7129 38.3906V21.1689C61.7131 18.9894 63.4806 17.2217 65.6602 17.2217H72.4766V11.123C72.4766 7.75457 69.7463 5.02377 66.3779 5.02344H41.2617V16.0186ZM36.2383 21.1826C32.7079 22.2577 30.1387 25.54 30.1387 29.4219C30.1389 33.3034 32.7083 36.5831 36.2383 37.6582V21.1826ZM41.2617 37.6582C44.7917 36.5832 47.3601 33.3035 47.3604 29.4219C47.3604 25.5399 44.7921 22.2576 41.2617 21.1826V37.6582ZM5.74121 37.3145H10.7646V22.2451H5.74121V37.3145ZM66.7363 37.3145H71.7598V22.2451H66.7363V37.3145Z" fill={color} />
            </Svg>
        </View>
    ));

    // Flatten data for FlashList
    const flattenedData = useMemo(() => {
        const flatList: any[] = [];

        if (data && data.length > 0) {
            data.forEach(section => {
                flatList.push({ type: 'header', title: section.title });
                section.data.forEach((game, index) => {
                    console.log(game)

                    flatList.push({
                        type: 'game',
                        item: game,
                        isFirst: index === 0,
                        isLast: index === section.data.length - 1
                    });
                });
            });
        }

        if (componentItems && componentItems.length > 0) {
            componentItems.forEach((comp, index) => {
                flatList.push({ type: 'component', item: comp, key: `comp-${index}` });
            });
        }

        return flatList;
    }, [data, componentItems]);

    const renderItem = useCallback(({ item }: any) => {
        if (item.type === 'header') {
            return <CardHeader title={item.title} theme={theme} />;
        }

        if (item.type === 'component') {
            return item.item;
        }

        return (
            <View style={{
                backgroundColor: colors.background[theme].elevated,
                borderTopRightRadius: item.isFirst ? 16 : 0,
                borderTopLeftRadius: item.isFirst ? 16 : 0,
                borderBottomLeftRadius: item.isLast ? 16 : 0,
                borderBottomRightRadius: item.isLast ? 16 : 0,
                overflow: 'hidden'
            }}>
                <GameCard
                    item={item.item}
                    widthScreen={SCREEN_WIDTH - 16}
                    mode="league"
                    remove={item.isLast}
                    date={item.item.date}
                    time={item.item.time}
                />
            </View>
        );
    }, [theme]);

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await onRefreshRequest();
        setRefreshing(false);
    }, []);

    return (
        <AnimatedFlashList
            data={flattenedData}
            estimatedListSize={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
            estimatedItemSize={120}
            overrideItemLayout={(layout, item: any) => {
                if (item.type === 'header') {
                    layout.size = 70.7; // Exact height of your CardHeader + margins
                } else if (item.type === 'game') {
                    layout.size = item.isLast ? 145 : 125; // Adjust slightly if the last item has extra padding
                } else if (item.type === 'component') {
                    layout.size = 500; // Standings component height
                }
            }}
            getItemType={(item: any) => item.type}
            keyExtractor={(item: any, index: number) => {
                if (item.type === 'header') return `header-${item.title}`;
                if (item.type === 'component') return item.key;
                return `${item.item.home.name}-${item.item.visitor.name}-${item.item.date}-${index}`;
            }}
            renderItem={renderItem}
            ref={(ref: any) => {
                if (ref) flatListRefs.current.set(pageIndex, ref);
            }}
            contentContainerStyle={{
                paddingTop: 300,
                paddingBottom: Platform.OS === 'android' ? 400 : 40,
                paddingHorizontal: 8
            }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
                <RefreshControl
                    tintColor={colors.text[theme].primary}
                    progressViewOffset={300}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
            ListHeaderComponent={() => <>{HeaderComponent && <HeaderComponent />}</>}
            ListEmptyComponent={() => (
                <View style={{ paddingTop: 60, width: '100%', alignItems: 'center' }}>
                    <EmptyBoxIcon color={colors.text[theme].secondary} />
                    <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Bold', fontSize: 17 }}>No games here</Text>
                </View>
            )}
        />
    );
});

// --- Main Component ---
const League = () => {
    const { authUser, theme } = useAuthContext();
    const route = useRoute<GameRouteProp>();
    const { org, league } = route.params;

    const mainScrollY = useSharedValue(0);
    const flatListRefs = useRef(new Map());
    const pagerScrollX = useSharedValue(0);
    const pagerRef = useRef<Animated.ScrollView>(null);

    const [standingsLoaded, setStandingsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStandingsLoaded(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleTabPress = useCallback((index: number) => {
        const targetX = index * SCREEN_WIDTH;
        pagerRef.current?.scrollTo({ x: targetX, animated: true });
        pagerScrollX.value = targetX;
    }, []);

    const currentPage = useDerivedValue(() => Math.round(pagerScrollX.value / SCREEN_WIDTH));
    const isSyncingScroll = useRef(false);
    const lastSyncedOffset = useRef(0);

    const syncTabs = useCallback((sourceIndex: number, offset: number) => {
        if (isSyncingScroll.current && Math.abs(offset - lastSyncedOffset.current) < 1) return;
        isSyncingScroll.current = true;
        lastSyncedOffset.current = offset;
        const targetOffset = offset < HEADER_SCROLL_DISTANCE ? offset : HEADER_SCROLL_DISTANCE;

        flatListRefs.current.forEach((ref, index) => {
            if (index !== sourceIndex && ref?.scrollToOffset) {
                ref.scrollToOffset({ offset: targetOffset, animated: false });
            }
        });
        setTimeout(() => { isSyncingScroll.current = false; }, 50);
    }, []);

    const animatedHeaderHeight = useAnimatedStyle(() => ({
        height: interpolate(mainScrollY.value, [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT], [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT], Extrapolation.CLAMP),
    }));

    const animatedSchool = useAnimatedStyle(() => {
        const translateY = interpolate(mainScrollY.value, [0, HEADER_MAX_HEIGHT], [0, -100], Extrapolation.CLAMP);
        const opacity = interpolate(mainScrollY.value, [0, HEADER_MAX_HEIGHT / 3], [1, 0], Extrapolation.CLAMP);
        return { transform: [{ translateY }], opacity };
    });

    const stickyHeaderAnim = useAnimatedStyle(() => ({
        opacity: interpolate(mainScrollY.value, [0, HEADER_MAX_HEIGHT / 2], [0, 1], Extrapolation.CLAMP)
    }));

    const contentContainerStyles = useMemo(() => ({ width: SCREEN_WIDTH * 2 }), []);
    const TABS = useMemo(() => ['Games', 'Standings'], []);

    // MEMOIZE THIS so it doesn't break the FlatList's useMemo reference equality!
    const standingsComponentArray = useMemo(() => [
        <Standings key="standings-comp" league={league} />
    ], [league]);

    const fetcher = useCallback(async (team: string) => {
        const queryParams: ScoresParams = { dateSelect: 'ALL', leagueSelect: getLeagueId(league) };
        const data = await getScores(queryParams);
        return groupedDataByStatus(data as RawInputRecord[]);
    }, [league]);

    const { data: leagueGames, error, isLoading, mutate } = useSWR(
        [`leagueGames+${league}`, league],
        ([key, team]) => fetcher(team),
        { revalidateOnFocus: true, revalidateOnReconnect: false, revalidateOnMount: true }
    );

    const [minTimeLoading, setMinTimeLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setMinTimeLoading(false), 200);
        return () => clearTimeout(timer);
    }, []);

    const isTrulyLoading = isLoading || minTimeLoading;

    return (
        <>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
            <View style={{ backgroundColor: '#665642', flex: 1, paddingTop: 48 }}>
                <View style={{ backgroundColor: colors.background[theme].general, flex: 1 }}>
                    <View style={{ backgroundColor: '#665642', position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
                        <Animated.View style={[animatedHeaderHeight, { display: 'flex', flexDirection: 'column' }]}>
                            <DynamicStickHeader stickyHeaderAnim={stickyHeaderAnim} label={league} subNote='' mode={'league'} theme={'dark'} final={false} />
                            <LeagueBanner animatedSchool={animatedSchool} label={league} subNote={'HCAA League'} />
                            <DynamicTabs tabs={TABS} currentPage={currentPage} onTabPress={handleTabPress} theme={'dark'} final={false} />
                        </Animated.View>
                    </View >

                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        scrollEventThrottle={16}
                        style={{ paddingTop: 0, backgroundColor: theme === 'dark' ? colors.background[theme].general : colors.background[theme].alternate }}
                        removeClippedSubviews={false}
                        ref={pagerRef}
                        onScroll={useAnimatedScrollHandler((event) => {
                            pagerScrollX.value = event.contentOffset.x;
                        })}
                        contentContainerStyle={contentContainerStyles}
                    >
                        <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
                            {leagueGames && !isTrulyLoading && (
                                <MyFlatList
                                    key={0}
                                    teamName={"St. Francis Xavier"}
                                    theme={theme}
                                    data={leagueGames}
                                    pageIndex={0}
                                    mainScrollY={mainScrollY}
                                    currentActivePageIndex={currentPage}
                                    flatListRefs={flatListRefs}
                                    syncTabs={syncTabs}
                                    onRefreshRequest={mutate}
                                />
                            )}
                            {isTrulyLoading && (
                                <View style={{ paddingTop: 320, width: '100%', alignItems: 'center' }}>
                                    <ActivityIndicator size={'large'} />
                                    <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Loading games...</Text>
                                </View>
                            )}
                            {error && (
                                <View style={{ paddingTop: 320, width: '100%', alignItems: 'center' }}>
                                    <ActivityIndicator size={'large'} />
                                    <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Please try again, an error occured.</Text>
                                </View>
                            )}
                        </View>

                        {/* Tab 2: Standings */}
                        <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
                            {standingsLoaded ? (
                                <MyFlatList
                                    key={1}
                                    teamName='St. Francis Xavier'
                                    theme={theme}
                                    data={null}
                                    pageIndex={1}
                                    mainScrollY={mainScrollY}
                                    currentActivePageIndex={currentPage}
                                    flatListRefs={flatListRefs}
                                    syncTabs={syncTabs}
                                    onRefreshRequest={mutate}
                                    componentItems={standingsComponentArray}
                                />
                            ) : (
                                <View style={{ paddingTop: 320, width: '100%', alignItems: 'center' }}>
                                </View>
                            )}
                        </View>
                    </Animated.ScrollView>
                </View>
            </View>
        </>
    )
}

export default League