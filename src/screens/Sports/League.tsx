import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { View, Text, useColorScheme, FlatList, TouchableOpacity, Image, RefreshControl, StatusBar, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Platform, SectionList } from 'react-native'
import colors from '../../colors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation';
import { Extrapolate, Extrapolation, interpolate, runOnJS, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
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
import Svg, { Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

// --- Types ---
type SectionItem = gameType | React.ReactElement;
export type groupedGameStatus = {
    title: string;
    data: SectionItem[];
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

// --- Static Components (Moved outside to prevent re-creation) ---

// 1. Data Processor (Heavy logic moved out)
const groupedDataByStatus = (data: RawInputRecord[]): groupedGameStatus[] => {
    if (!data || data.length === 0) return [];

    const transformedGames: gameType[] = data.map(record => {
        let formattedDate: string | undefined = undefined;
        if (record.date) {
            try {
                if (/^\d{4}-\d{2}-\d{2}$/.test(record.date) || /^[A-Za-z]{3}\s\d{1,2}$/.test(record.date)) {
                    const dateObj = new Date(record.date);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                } else {
                    const isoDate = convertFullDateToISO(record.date);
                    if (isoDate) {
                        const dateObj = new Date(isoDate);
                        if (!isNaN(dateObj.getTime())) {
                            formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }
                    }
                }
            } catch (e) { }
        }

        return {
            date: formattedDate,
            league: record.league || 'Unknown League',
            location: record.location,
            notes: record.notes,
            time: record.time,
            home: { name: record.schools[0] || 'Home Team', score: record.scores.home },
            visitor: { name: record.schools[1] || 'Visitor Team', score: record.scores.visitor },
            sets: record.sets ? { home: record.sets.home, visitor: record.sets.visitor } : undefined
        };
    });

    const upcomingGames: gameType[] = [];
    const pastGames: gameType[] = [];

    transformedGames.forEach(game => {
        const hasScores = game.home.score !== null && game.visitor.score !== null;
        const isPending = game.time?.toLowerCase().includes('pending') ?? false;
        if (hasScores || isPending) {
            pastGames.push(game);
        } else {
            upcomingGames.push(game);
        }
    });

    const sortGames = (a: gameType, b: gameType, isPast: boolean) => {
        const dateA = a.date || (isPast ? '1900-01-01' : '3000-01-01');
        const dateB = b.date || (isPast ? '1900-01-01' : '3000-01-01');
        const dateObjA = new Date(dateA.includes(' ') ? `${dateA}, ${new Date().getFullYear()}` : dateA);
        const dateObjB = new Date(dateB.includes(' ') ? `${dateB}, ${new Date().getFullYear()}` : dateB);
        return dateObjA.getTime() - dateObjB.getTime();
    };

    upcomingGames.sort((a, b) => sortGames(a, b, false));
    pastGames.sort((a, b) => sortGames(b, a, true));

    const groupedData: groupedGameStatus[] = [];
    if (upcomingGames.length > 0) groupedData.push({ title: "Upcoming Games", data: upcomingGames });
    if (pastGames.length > 0) groupedData.push({ title: "Past Games", data: pastGames });

    return groupedData;
};

// 2. Visual Components
const CardHeader = React.memo(({ title, theme }: { title: string, theme: any }) => (
    <View style={{
        marginTop: 16,
        backgroundColor: colors.background[theme].elevated,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: colors.fills[theme].stroke,
        borderBottomWidth: 0,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center'
    }}>
        <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 18, color: colors.text[theme].primary }}>
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

    const sections = React.useMemo(() => {
        if (data && data.length > 0) return data;
        if (componentItems && componentItems.length > 0) {
            return [{ title: 'hidden_header', data: componentItems }];
        }
        return [];
    }, [data, componentItems]);

    const renderSectionHeader = useCallback(({ section: { title } }: any) => {
        if (title === 'hidden_header') return null;
        return <CardHeader title={title} theme={theme} />;
    }, [theme]);

    const renderItem = useCallback(({ item, index, section }: any) => {
        if (section.title === 'hidden_header') return item;

        const isLastItem = index === section.data.length - 1;
        return (
            <View style={{
                backgroundColor: colors.background[theme].elevated,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.fills[theme].stroke,
                borderBottomLeftRadius: isLastItem ? 16 : 0,
                borderBottomRightRadius: isLastItem ? 16 : 0,
                borderBottomWidth: isLastItem ? 1 : 0,
                overflow: 'hidden'
            }}>
                <GameCard
                    item={item}
                    widthScreen={SCREEN_WIDTH - 16}
                    mode="league"
                    remove={isLastItem}
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
        <AnimatedSectionList
            sections={sections}
            keyExtractor={(item: any, index: number) => {
                if (item && typeof item === 'object' && 'home' in item) {
                    const game = item as gameType;
                    return `${game.home.name}-${game.visitor.name}-${game.date}-${index}`;
                }
                return `component-${index}`;
            }}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            ref={(ref: any) => {
                if (ref) flatListRefs.current.set(pageIndex, ref);
            }}

            // --- PERFORMANCE TUNING ---
            initialNumToRender={4}     // Lowered from 6 to unblock UI faster
            maxToRenderPerBatch={4}    // Added to prevent large batches blocking scroll
            updateCellsBatchingPeriod={50}
            windowSize={5}
            removeClippedSubviews={true}
            stickySectionHeadersEnabled={false}

            style={{ maxWidth: SCREEN_WIDTH, paddingTop: 300 }}
            contentContainerStyle={{
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
                    <View style={{ transform: [{ scale: 0.6 }] }}>
                        <Svg height={78} width={78}>
                            <Path d="M66.3779 0C72.5205 0.000331843 77.5 4.98036 77.5 11.123V47.7197C77.4999 53.8624 72.5205 58.8424 66.3779 58.8428H11.123C4.9802 58.8428 7.30663e-05 53.8626 0 47.7197V11.123C0 4.98016 4.98016 0 11.123 0H66.3779ZM11.123 5.02344C7.75437 5.02344 5.02344 7.75437 5.02344 11.123V17.2217H11.8408C14.0202 17.222 15.7869 18.9896 15.7871 21.1689V38.3906C15.7871 40.5702 14.0203 42.3376 11.8408 42.3379H5.02344V47.7197C5.02351 51.0883 7.75441 53.8193 11.123 53.8193H36.2383V42.8232C29.9085 41.6442 25.1155 36.0934 25.1152 29.4219C25.1152 22.7501 29.9082 17.1977 36.2383 16.0186V5.02344H11.123ZM41.2617 16.0186C47.5918 17.1975 52.3838 22.75 52.3838 29.4219C52.3835 36.0935 47.5916 41.6444 41.2617 42.8232V53.8193H66.3779C69.7463 53.819 72.4765 51.0881 72.4766 47.7197V42.3379H65.6602C63.4804 42.3379 61.7129 40.5704 61.7129 38.3906V21.1689C61.7131 18.9894 63.4806 17.2217 65.6602 17.2217H72.4766V11.123C72.4766 7.75457 69.7463 5.02377 66.3779 5.02344H41.2617V16.0186ZM36.2383 21.1826C32.7079 22.2577 30.1387 25.54 30.1387 29.4219C30.1389 33.3034 32.7083 36.5831 36.2383 37.6582V21.1826ZM41.2617 37.6582C44.7917 36.5832 47.3601 33.3035 47.3604 29.4219C47.3604 25.5399 44.7921 22.2576 41.2617 21.1826V37.6582ZM5.74121 37.3145H10.7646V22.2451H5.74121V37.3145ZM66.7363 37.3145H71.7598V22.2451H66.7363V37.3145Z"
                                fill={colors.text[theme].secondary}
                            />
                        </Svg>
                    </View>
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

    // Lazy Load state for the second tab
    const [standingsLoaded, setStandingsLoaded] = useState(false);

    useEffect(() => {
        // Delay loading the standings tab to allow the first tab to be interactive immediately
        const timer = setTimeout(() => {
            setStandingsLoaded(true);
        }, 500); // 500ms delay
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

    // Fetcher now uses the external groupedDataByStatus
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
                <View style={{ backgroundColor: colors.background[theme].general }}>
                    <View style={{ backgroundColor: '#665642', position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
                        <Animated.View style={[animatedHeaderHeight, { display: 'flex', flexDirection: 'column' }]}>
                            <DynamicStickHeader stickyHeaderAnim={stickyHeaderAnim} label={league} subNote='' mode={'league'} theme={'dark'} />
                            <LeagueBanner animatedSchool={animatedSchool} label={league} subNote={'Halton Catholic Athletic Association'} />
                            <DynamicTabs tabs={TABS} currentPage={currentPage} onTabPress={handleTabPress} theme={'dark'} />
                        </Animated.View>
                    </View >

                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        scrollEventThrottle={16}
                        style={{ paddingTop: 0, backgroundColor: theme === 'dark' ? colors.background[theme].general : colors.background[theme].alternate }}
                        removeClippedSubviews={true}
                        ref={pagerRef}
                        onScroll={useAnimatedScrollHandler((event) => {
                            pagerScrollX.value = event.contentOffset.x;
                        })}
                        contentContainerStyle={contentContainerStyles}
                    >
                        <View style={{ width: SCREEN_WIDTH }}>
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
                                    <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Loading games...</Text>
                                </View>
                            )}
                            {error && (
                                <View style={{ paddingTop: 320, width: '100%', alignItems: 'center' }}>
                                    <ActivityIndicator size={'large'} />
                                    <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Please try again, an error occured.</Text>
                                </View>
                            )}
                        </View>

                        {/* Tab 2: Standings */}
                        <View style={{ width: SCREEN_WIDTH }}>
                            {/* Lazy load Standings to prevent UI block on initial mount */}
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
                                    componentItems={[
                                        <Standings league={league} />
                                    ]}
                                />
                            ) : (
                                <View style={{ paddingTop: 320, width: '100%', alignItems: 'center' }}>
                                    {/* Optional: Add small spinner or just blank space */}
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