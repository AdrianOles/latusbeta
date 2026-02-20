import React, { useRef, useState, useCallback } from 'react'
import { View, Text, useColorScheme, FlatList, TouchableOpacity, Image, RefreshControl, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Pressable, Modal, Platform } from 'react-native'
import colors from '../../colors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation';
import { Extrapolate, Extrapolation, interpolate, runOnJS, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated'
import { GameCard } from '../Sports/components/GameCard';
import { gameType } from '../../types/Games';
import DynamicStickHeader from './components/DynamicStickHeader';
import GameBanner from './components/GameBanner';
import DynamicTabs from './components/DynamicTabs';
import GameInfo, { removeLeadingZero } from './components/GameInfo';
import { brLogo, stfxLogo } from '../../../assets';
import Standings from './components/Standings';
import { school } from '.';
import { useAuthContext } from '../../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { abbreviateRank } from './components/LeagueGame';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

type GameRouteProp = RouteProp<HomeStackParamList, 'Game'>;

const HEADER_MAX_HEIGHT = 280; // Define or pass down if needed for calculations
const HEADER_MIN_HEIGHT = 104;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface MyFlatListProps {
    data: gameType[] | null;
    componentItems?: React.ReactElement[];
    HeaderComponent?: React.ComponentType<any>;
    pageIndex: number;
    theme: 'light' | 'dark';
    flatListRefs: React.MutableRefObject<Map<number, any>>;
    syncTabs: (index: number, scrollY: number) => void;
    currentActivePageIndex: Animated.SharedValue<number>;
    mainScrollY: Animated.SharedValue<number>;
}

const MyFlatList = React.memo(({
    data,
    theme,
    componentItems,
    HeaderComponent,
    pageIndex,
    flatListRefs,
    syncTabs,
    currentActivePageIndex,
    mainScrollY,
}: MyFlatListProps) => {
    const navigation = useNavigation<HomeStackParamList>();

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (currentActivePageIndex.value === pageIndex) {
                const y = event.contentOffset.y;
                const clampedY = Math.max(0, y);
                mainScrollY.value = clampedY;
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

    const hasData = data && data.length > 0;
    const hasComponentItems = !hasData && componentItems && componentItems.length > 0;
    const dataSource = hasData
        ? data
        : (hasComponentItems ? componentItems.map((_, index) => ({ _internalId: index })) : []);

    const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
        if (hasData) {
            return (
                <>
                    <GameCard item={item} widthScreen={SCREEN_WIDTH} />
                </>
            );
        }

        if (hasComponentItems) {
            return componentItems[index] || null;
        }

        return null;
    }, [theme, navigation, hasData, hasComponentItems, componentItems]);

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <Animated.FlatList
            data={dataSource}
            keyExtractor={(item, index) => `game-${index}`}
            renderItem={renderItem}
            ref={(ref: any) => {
                if (ref) flatListRefs.current.set(pageIndex, ref);
            }}
            style={{ maxWidth: SCREEN_WIDTH, paddingTop: 300 }}
            contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 200 : 40 }}
            initialNumToRender={pageIndex != 1 ? 1 : 10}
            windowSize={4}
            updateCellsBatchingPeriod={50}
            // refreshControl={
            //     <RefreshControl tintColor={colors.text[theme].primary} progressViewOffset={320} refreshing={refreshing} onRefresh={onRefresh} />
            // }
            ListHeaderComponent={() => (
                <>
                    {HeaderComponent && (
                        <HeaderComponent />
                    )}
                    {
                        !(data && data.length > 0) || !hasComponentItems && (
                            <View style={{ height: SCREEN_HEIGHT, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                {
                                    pageIndex === 0 ? (
                                        <Text>No games this Sunday</Text>
                                    ) : pageIndex === 6 ? (
                                        <Text>No games this Saturday</Text>
                                    ) : (
                                        <Text>No games</Text>
                                    )
                                }
                            </View>
                        )
                    }
                </>
            )}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
        />
    );
});

const Game = () => {
    const { authUser, theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>(); // If GameCard needs navigation
    const route = useRoute<GameRouteProp>();
    const {
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        league,
        time,
        notes,
        dateString,
        sets,
        location
    }: {
        homeTeam: string,
        awayTeam: string,
        homeScore: string,
        awayScore: string,
        league: string,
        notes?: string,
            time?: string,
        location?: string,
        dateString?: string
        // CHANGE IS HERE: make 'sets' optional by adding '?'
        sets?: { home: number[] | undefined, visitor: number[] | undefined }
    } = route.params;
    const colorScheme = useColorScheme(); // Returns 'light' or 'dark'
    const mainScrollY = useSharedValue(0); // Renamed to mainScrollY
    const flatListRefs = useRef(new Map());
    const pagerScrollX = useSharedValue(0); // To track the horizontal scroll of the main Pager
    const pagerRef = useRef<Animated.ScrollView>(null);
    const [posting, setPosting] = useState<boolean>(false);

    const handleTabPress = useCallback((index: number) => {
        const targetX = index * SCREEN_WIDTH;
        pagerRef.current?.scrollTo({ x: targetX, animated: true });
    }, []);

    const currentPage = useDerivedValue(() => {
        return Math.round(pagerScrollX.value / SCREEN_WIDTH);
    });

    const isSyncingScroll = useRef(false);
    const lastSyncedOffset = useRef(0);

    const syncTabs = useCallback((sourceIndex: number, offset: number) => {
        if (isSyncingScroll.current && Math.abs(offset - lastSyncedOffset.current) < 1) return;

        isSyncingScroll.current = true;
        lastSyncedOffset.current = offset;

        const targetOffset = offset < HEADER_SCROLL_DISTANCE
            ? offset
            : HEADER_SCROLL_DISTANCE;

        flatListRefs.current.forEach((ref, index) => {
            if (index !== sourceIndex && ref?.scrollToOffset) {
                ref.scrollToOffset({
                    offset: targetOffset,
                    animated: false
                });
            }
        });

        setTimeout(() => {
            isSyncingScroll.current = false;
        }, 50);
    }, []);

    const animatedHeaderHeight = useAnimatedStyle(() => ({
        height: interpolate(
            mainScrollY.value,
            [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT], // Adjust range to match pull amount
            [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
            Extrapolate.CLAMP
        ),
    }));

    const animatedSchool = useAnimatedStyle(() => {
        const translateY = interpolate(
            mainScrollY.value,
            [0, HEADER_MAX_HEIGHT], // Should probably be HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT
            [0, -100], // Adjust this if header content moves too much
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            mainScrollY.value,
            [0, HEADER_MAX_HEIGHT / 3],
            [1, 0],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    const pages = [0, 1];

    const contentContainerStyles = React.useMemo(() => ({
        width: SCREEN_WIDTH * pages.length,
    }), [SCREEN_WIDTH, pages.length]);

    const TABS = ['Game Info', 'Standings'];

    React.useEffect(() => {
        // Start prefetching when the component mounts
        Image.prefetch(Image.resolveAssetSource(brLogo).uri);
        Image.prefetch(Image.resolveAssetSource(stfxLogo).uri);
    }, []);

    const getWinner = (): school => {
        if (homeScore > awayScore) {
            return homeTeam as school;
        } else if (homeScore < awayScore) {
            return awayTeam as school;
        } else {
            return homeTeam as school;
        }
    }

    const creatingPost = () => {
        setPosting(true);
    }

    const stickyHeaderAnim = useAnimatedStyle(() => {
            const opacity = interpolate(
                mainScrollY.value,
                [0, HEADER_MAX_HEIGHT / 2], // Adjust range to match pull amount
                [0, 1],
                Extrapolation.CLAMP
            )

            return {
                opacity
            }
    });
    
    return (
        <>
            <StatusBar translucent={true} style={theme === 'dark' ? 'light' : 'dark'} backgroundColor='transparent' />
            <View style={{ backgroundColor: colors.background[theme].elevated, flex: 1, paddingTop: 48 }}>
                <View style={{ backgroundColor: colors.background[theme].general }}>
                    <View style={{ backgroundColor: colors.background[theme].elevated, position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
                        <Animated.View style={[animatedHeaderHeight, { display: 'flex', flexDirection: 'column' }]}>
                            <DynamicStickHeader stickyHeaderAnim={stickyHeaderAnim} posting={creatingPost} label={abbreviateRank(league)} mode={'game'} theme={theme} />
                            <GameBanner theme={theme} date={dateString} time={removeLeadingZero(time ? time : '')} pending={time?.includes("pending")} animatedSchool={animatedSchool} homeScore={homeScore} awayScore={awayScore} home={homeTeam} away={awayTeam} league={league} />
                            <DynamicTabs
                                theme={theme}
                                tabs={TABS}
                                currentPage={currentPage}
                                onTabPress={handleTabPress}
                            />
                        </Animated.View>
                    </View>

                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        scrollEventThrottle={16}
                        style={{ paddingTop: 0, backgroundColor: colors.background[theme].alternate }}
                        removeClippedSubviews={true}
                        ref={pagerRef}
                        onScroll={useAnimatedScrollHandler((event) => {
                            pagerScrollX.value = event.contentOffset.x;
                        })}
                        contentContainerStyle={contentContainerStyles}
                    >
                        <MyFlatList
                            key={0}
                            theme={theme}
                            data={null}
                            pageIndex={0}
                            mainScrollY={mainScrollY}
                            currentActivePageIndex={currentPage}
                            flatListRefs={flatListRefs}
                            syncTabs={syncTabs}
                            componentItems={[
                                <GameInfo pending={time?.includes("pending")} notes={notes} home={homeTeam} dateString={dateString} away={awayTeam} location={location || homeTeam} time={time} league={abbreviateRank(league)} sets={sets ? sets : undefined} />
                            ]}
                        />
                        <MyFlatList
                            key={1}
                            theme={theme}
                            data={null}
                            pageIndex={1}
                            // Pass the new mainScrollY value and currentPage
                            mainScrollY={mainScrollY}
                            currentActivePageIndex={currentPage}
                            flatListRefs={flatListRefs}
                            syncTabs={syncTabs}
                            componentItems={[
                                <Standings home={homeTeam as school} away={awayTeam as school} league={league} />
                            ]}
                        />
                    </Animated.ScrollView>
                </View>

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={posting}
                    onRequestClose={() => setPosting(false)} // For Android back button
                >
                    <Pressable onPress={() => setPosting(false)} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#000000A0', paddingBottom: 42, paddingHorizontal: 32 }}>
                        <Pressable style={{ backgroundColor: colors.background[theme].elevated, borderRadius: 24, paddingBottom: 40, padding: 16, marginBottom: 0, marginHorizontal: 16, display: 'flex', width: '100%' }}>

                            <TouchableOpacity onPress={() => setPosting(false)}
                                style={{
                                    position: 'absolute', top: 16, right: 16, borderRadius: 250, zIndex: 10,
                                    backgroundColor: colors.fills[theme].standard, padding: 8
                                }}>
                                <Ionicons name='close-outline' size={20} color={colors.text[theme].primary} />
                            </TouchableOpacity>

                            <View style={{ paddingBottom: 24 }}>
                                <Text style={{ fontSize: 22, fontFamily: 'Figtree-Bold', lineHeight: 28, textAlign: 'center', color: colors.text[theme].primary }}>Share the Passion</Text>
                                <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, textAlign: 'center', color: colors.text[theme].secondary }}>Create a game day post</Text>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                                <View style={{ marginRight: 24 }}>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate("SportsShareGameStory", {
                                            org: "HCAA", mode: "Story",
                                            homeTeam: homeTeam,
                                            awayTeam: awayTeam,
                                            homeScore: homeScore,
                                            awayScore: awayScore
                                        }); setPosting(false);
                                    }}
                                        style={{
                                            height: 120, width: 72, borderWidth: 2, borderRadius: 16, backgroundColor: colors.background[theme].alternate,
                                            borderColor: colors.fills[theme].stroke, marginBottom: 8, boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.12)'
                                        }} />
                                    <Text style={{ textAlign: 'center', fontSize: 15, lineHeight: 20, fontFamily: 'Figtree-SemiBold', color: colors.text[theme].secondary }}>Story</Text>
                                </View>
                                <View>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate("SportsShareGame", {
                                            org: "HCAA",
                                            mode: "Post",
                                            homeTeam: homeTeam,
                                            awayTeam: awayTeam,
                                            homeScore: homeScore,
                                            awayScore: awayScore
                                        }); setPosting(false);
                                    }} style={{
                                        height: 120, width: 120, borderWidth: 2, borderRadius: 16, backgroundColor: colors.background[theme].alternate,
                                        borderColor: colors.fills[theme].stroke, marginBottom: 8, boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.12)'
                                    }} />
                                    <Text style={{ textAlign: 'center', fontSize: 15, lineHeight: 20, fontFamily: 'Figtree-SemiBold', color: colors.text[theme].secondary }}>Post</Text>
                                </View>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            </View>
        </>
    )
}

export default Game
