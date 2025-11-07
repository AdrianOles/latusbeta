import React, { useRef, useState, useCallback, useMemo } from 'react'
import { View, Text, useColorScheme, FlatList, TouchableOpacity, Image, RefreshControl, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Pressable, Appearance } from 'react-native'
import colors from '../../colors';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeStackParamList } from '../../navigation';
import { Extrapolate, interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, useAnimatedReaction, Extrapolation } from 'react-native-reanimated';
import Animated from 'react-native-reanimated'
import { gameType } from '../../types/Games';
import { weeklyGames } from '../../mocks/sports';
import SignInBanner from './components/SignInBanner';
import StickHeader from './components/StickHeader';
import { StatusBar } from 'expo-status-bar';
import { GameCard } from './components/GameCard';
import { AuthUserCustomType, AuthUserType, useAuthContext } from '../../contexts/AuthContext';
import useSWR from 'swr';
import { ApiError, get, post } from 'aws-amplify/api';
import { useEffect } from 'react';
import { LeagueGame } from './components/LeagueGame';
import { SharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import NoResults from './components/NoResults';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export type school = "St. Francis Xavier" | "Bishop Reding" | "St. Ignatius of Loyola" | "Holy Trinity" |
    "St. Kateri Tekakwitha" | "Assumption" | "St. Thomas Aquinas" | "Notre Dame" | "Corpus Christi" |
    "Christ the King";

interface MyFlatListProps {
    data: groupedLeagueType[] | null;
    authUser: AuthUserCustomType | null;
    componentItems?: React.ReactElement[]; // <-- Add this new prop
    HeaderComponent?: React.ComponentType<any>;
    pageIndex: number;
    theme: 'light' | 'dark';
    mainScrollY: SharedValue<number>;
    currentActivePageIndex: SharedValue<number>;
    customRefreshHeight: SharedValue<number>;
    isUiLoading: SharedValue<boolean>;
    flatListRefs: React.RefObject<Map<number, any>>;
    syncTabs: (index: number, scrollY: number) => void;
    startRefresh: () => void;
}

export type groupedLeagueType = {
    league: string;
    games: gameType[];
};

const fetchGames = async (): Promise<gameType[][]> => {
    console.log("Fetching games...");

    try {
        const restOperation = get({
            apiName: 'gamesHCAA',
            path: '/week',
            options: {
                queryParams: {
                    dateSelect: '2024-09-15',
                    leagueid: 'ALL',
                    schoolSelect: 'ALL',
                    leagueSelect: 'ALL',
                }
            }
        });

        console.log(restOperation);

        const { body } = await restOperation.response;
        console.log(body);
        const json = await body.json();
        console.log(json);
        // Cast the returned JSON to the correct type: an array of arrays of gameType.
        return json as gameType[][];
    } catch (error) {
        if (error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`Received ${statusCode} error response with payload: ${body}`);
            }
        }
        // It's good practice to re-throw or return a specific value on error.
        // Returning an empty array is a safe default.
        return [];
    }
};
const HEADER_MAX_HEIGHT = 182;
const HEADER_MIN_HEIGHT = 102;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const MyFlatList = React.memo(({
    data,
    authUser,
    theme,
    componentItems,
    HeaderComponent,
    pageIndex,
    mainScrollY,
    currentActivePageIndex,
    flatListRefs,
    syncTabs,
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
            if (item.league) {
                return (
                    <LeagueGame
                        key={item.league}
                        league={item.league}
                        items={item.games}
                        widthScreen={SCREEN_WIDTH}
                        teamName={'St. Francis Xavier'}
                        mode={'game'}

                    />
                );
            } else {
                return (
                    <View key={index} style={{ height: 100 }}>
                        <Text>Hello</Text>
                    </View>
                )
            }
        }

        if (hasComponentItems) {
            return componentItems[index] || null;
        }

        return (
            <TouchableOpacity onPress={() => navigation.navigate("SportsLeague", { leagueId: "testing", org: "HCAA" })} style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', paddingBottom: 12, borderColor: colors.fills[theme].stroke, borderBottomWidth: 1, paddingTop: 0 }}>
                <Text style={{
                    color: colors.text[theme].primary, paddingLeft: 16, marginHorizontal: 4,
                    fontFamily: 'Figtree-Bold', fontSize: 17, lineHeight: 21,
                }}>Testing</Text >
                <Ionicons name='chevron-forward-outline' size={24} />
            </TouchableOpacity >
        ); // Should not happen if dataSource is managed correctly
    }, [theme, navigation, hasData, hasComponentItems, componentItems]); // Add new dependencies

    // --- END: Core Logic Change ---
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchGames();
        setRefreshing(false);
    }, []);


    return (
        <Animated.FlatList
            // Use the new dynamic dataSource and keyExtractor
            data={dataSource}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.league ? `league-${item.league}` : `item-${item.id || index}`}
            ref={(ref: any) => {
                if (ref) flatListRefs.current.set(pageIndex, ref);
            }}
            style={{ maxWidth: SCREEN_WIDTH, paddingTop: authUser ? 140 : 240 }}
            initialNumToRender={pageIndex != 3 ? 1 : 10}
            windowSize={4}
            refreshControl={
                <RefreshControl tintColor={colors.text[theme].primary} progressViewOffset={authUser ? 120 : 200} refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{paddingBottom: 40, paddingHorizontal: 16}}
            updateCellsBatchingPeriod={50}
            ListHeaderComponent={() => (
                <>
                    {HeaderComponent && (
                        <HeaderComponent />
                    )}
                    {
                        !(data && data.length > 0) && (
                            <View style={{ height: SCREEN_HEIGHT, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <NoResults
                                    theme={theme}
                                    mainLabel={pageIndex === 0 ? ("No games here")
                                        : pageIndex === 6 ? ("No games here")
                                            : ("No games here")}
                                    subLabel={'Maybe try a different day'}
                                />
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

const Sports = () => {
    const { authUser, theme } = useAuthContext();
    const mainScrollY = useSharedValue(0); // Renamed to mainScrollY
    const customRefreshHeight = useSharedValue(0); // Tracks negative scroll for pull-to-refresh
    const isUiLoading = useSharedValue(false); // Initial state: not loading
    const flatListRefs = useRef(new Map());
    const pagerRef = useRef<Animated.ScrollView>(null);
    const NEW_HEADER_HEIGHT = authUser ? (HEADER_MAX_HEIGHT - 90) : HEADER_MAX_HEIGHT
    const NEW_HEADER_MIN = authUser ? (HEADER_MIN_HEIGHT - 14) : HEADER_MIN_HEIGHT
    const [loading, setLoading] = useState<boolean>(false);

    const initialPage = 3;
    const initialOffset = initialPage * SCREEN_WIDTH;
    const initialOffsetRef = useRef(initialOffset);
    const pagerScrollX = useSharedValue(initialOffset);

    const [dateSearch, setDateSearch] = useState<string>("2024-09-18");

    const updateDateForPage = useCallback((pageIndex: number) => {
        const initialDate = new Date("2024-09-18");
        const dateDiff = pageIndex - initialPage;

        // All Date manipulation happens here, safely on the JS thread.
        initialDate.setDate(initialDate.getDate() + dateDiff);

        const formattedDate = initialDate.toISOString().split('T')[0];
        setDateSearch(formattedDate);
    }, [initialPage]);
    
    const handleTabPress = useCallback((index: number) => {
        const targetX = index * SCREEN_WIDTH;
        pagerRef.current?.scrollTo({ x: targetX, animated: true });
    }, []);

    const currentPage = useDerivedValue(() => {
        return Math.round(pagerScrollX.value / SCREEN_WIDTH);
    });

    useAnimatedReaction(
        () => {
            return currentPage.value;
        },
        (newPage, oldPage) => {
            if (newPage !== null) {
                runOnJS(updateDateForPage)(newPage);
            }
        },
        [updateDateForPage] // Add the function to the dependency array
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            runOnJS(updateDateForPage)(initialPage);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

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
            [0, NEW_HEADER_HEIGHT - NEW_HEADER_MIN],
            [NEW_HEADER_HEIGHT, NEW_HEADER_MIN],
            Extrapolation.CLAMP
        ),
    }));

    const animatedSchool = useAnimatedStyle(() => {
        const height = interpolate(
            mainScrollY.value,
            [0, NEW_HEADER_HEIGHT],
            [80, 0],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            mainScrollY.value,
            [0, 40],
            [1, 1],
            Extrapolation.CLAMP
        );

        return {
            height: height,
            opacity
        };
    });

    const startRefresh = useCallback(async () => {
        // Simulate your data fetching
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Signal the UI thread that loading is complete
        isUiLoading.value = false;
        customRefreshHeight.value = withSpring(0);
    }, []);

    const isSyncingScroll = useRef(false);
    const lastSyncedOffset = useRef(0);

    const pages = [0, 1, 2, 3, 4, 5, 6];

    const { data, error, isLoading } = useSWR('games', fetchGames, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const contentContainerStyles = React.useMemo(() => ({
        width: SCREEN_WIDTH * 7,
    }), [SCREEN_WIDTH, pages.length, data]);

    const groupGamesByLeague = (gamesData: gameType[]): groupedLeagueType[] => {
        if (!gamesData) return [];

        // Use a Record to define the type of groupedData
        const groupedData: Record<string, groupedLeagueType> = {};

        gamesData.forEach(game => {
            const leagueName = game.league;
            if (!groupedData[leagueName]) {
                groupedData[leagueName] = {
                    league: leagueName,
                    games: []
                };
            }
            groupedData[leagueName].games.push(game);
        });

        return Object.values(groupedData);
    };

    const groupedDataByDay = useMemo(() => {
        return weeklyGames?.map(dayGames => groupGamesByLeague(dayGames));
    }, [weeklyGames]);

    const memoizedSignInBanner = useMemo(() => {
        return <SignInBanner animation={animatedSchool} />;
    }, [animatedSchool]);

    const handleDayChange = () => {
        console.log("handling day change");
    }

    return (
        <>
            <StatusBar translucent={true} style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background[theme].elevated} />
            <SafeAreaView edges={['left', 'right', 'top']} style={{ backgroundColor: colors.background[theme].elevated, flex: 1 }}>
                <View style={{ backgroundColor: colors.background[theme].general }}>
                    <View style={{ position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
                        <Animated.View style={[animatedHeaderHeight, { display: 'flex', flexDirection: 'column' }]}>
                            {!authUser && memoizedSignInBanner}
                            <StickHeader
                                authUser={authUser}
                                currentPage={currentPage}
                                onTabPress={handleTabPress}
                                onDayPress={handleDayChange}
                                dateSearch={dateSearch}
                            />
                        </Animated.View>
                    </View>

                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        scrollEventThrottle={16}
                        style={{ paddingTop: 0, backgroundColor: theme === 'dark' ? colors.background[theme].general : colors.background[theme].alternate }}
                        removeClippedSubviews={true}
                        ref={pagerRef}
                        contentOffset={{ x: initialOffsetRef.current, y: 0 }}
                        onScroll={useAnimatedScrollHandler((event) => {
                            pagerScrollX.value = event.contentOffset.x;
                        })}
                        contentContainerStyle={contentContainerStyles}
                    >
                        {
                            groupedDataByDay && groupedDataByDay.map((day, index) => (
                                day && (
                                    <MyFlatList
                                        theme={theme}
                                        key={index}
                                        data={day}
                                        authUser={authUser}
                                        pageIndex={index}
                                        mainScrollY={mainScrollY}
                                        currentActivePageIndex={currentPage}
                                        customRefreshHeight={customRefreshHeight}
                                        isUiLoading={isUiLoading}
                                        flatListRefs={flatListRefs}
                                        syncTabs={syncTabs}
                                        startRefresh={startRefresh}
                                    />
                                )
                            ))
                        }
                        {
                            !groupedDataByDay && (
                                <View style={{ paddingTop: authUser ? 260 : 320, width: '100%', display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size={'large'} />
                                    <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Loading games...</Text>
                                </View>
                            )
                        }
                    </Animated.ScrollView>
                </View>
            </SafeAreaView>
        </>
    )
}

export default Sports