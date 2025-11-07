import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { View, Text, useColorScheme, FlatList, TouchableOpacity, Image, RefreshControl, StatusBar, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from 'react-native'
import colors from '../../colors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation';
import { Extrapolate, Extrapolation, interpolate, runOnJS, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated'
import StickHeader from '../../components/collapse/StickHeader';
import CollapseHeader from '../../components/collapse/CollapseHeader';
import TabBars from '../../components/collapse/TabBars';
import { GameCard } from '../Sports/components/GameCard';
import { gameType } from '../../types/Games';
import DynamicStickHeader from './components/DynamicStickHeader';
import GameBanner from './components/GameBanner';
import DynamicTabs from './components/DynamicTabs';
import GameInfo from './components/GameInfo';
import { brLogo, stfxLogo } from '../../../assets';
import Standings from './components/Standings';
import LeagueBanner from './components/LeagueBanner';
import TeamBanner from './components/TeamBanner';
import { ApiError, get } from 'aws-amplify/api';
import useSWR from 'swr';
import { school } from '.';
import TeamInfo from './components/TeamInfo';
import { leagueGames } from '../../mocks/sports';
import { useAuthContext } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { LeagueGame } from './components/LeagueGame';

const SCREEN_WIDTH = Dimensions.get('window').width;

const fetchGames = async (team: string, leagueid?: string) => {
    console.log("Fetching games from team...");

    try {
        const restOperation = get({
            apiName: 'gamesHCAA',
            path: '/week',
            options: {
                queryParams: {
                    dateSelect: '2024-09-15',
                    leagueid: leagueid || 'ALL',
                    schoolid: team || 'ALL',
                    leagueSelect: 'ALL',
                }
            }
        });

        const { body } = await restOperation.response;
        const json = await body.json();
        // console.log(json);
        return json as Array<gameType>;
    } catch (error) {
        if (error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    headers,
                    body
                } = error.response;
                console.error(`Received ${statusCode} error response with payload: ${body}`);
            }
        }
    } finally {
    }
};

// Define MyFlatList as a separate component outside of Testrun
interface MyFlatListProps {
    data: groupedGameStatus[] | null;
    componentItems?: React.ReactElement[]; // <-- Add this new prop
    HeaderComponent?: React.ComponentType<any>;
    pageIndex: number;
    teamName: school,
    theme: 'light' | 'dark';
    mainScrollY: Animated.SharedValue<number>;
    currentActivePageIndex: Animated.SharedValue<number>;
    flatListRefs: React.MutableRefObject<Map<number, any>>;
    syncTabs: (index: number, scrollY: number) => void;
}

export type groupedGameStatus = {
    league: string;
    games: gameType[];
}

const HEADER_MAX_HEIGHT = 276; // Define or pass down if needed for calculations
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
type GameRouteProp = RouteProp<HomeStackParamList, 'Team'>;

const MyFlatList = React.memo(({
    data,
    theme,
    teamName,
    componentItems, // <-- Destructure the new prop
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
            // Only update the main scrollY if this tab is the active one
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

    const dataSource = hasData ? data.flat() : (hasComponentItems ? componentItems.map((_, index) => ({ _internalId: index })) : []);


    const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
        // 3. Conditionally render based on the content type.
        if (hasData) {
            if (item.league) {
                return (
                    <LeagueGame
                        teamName={teamName}
                        mode={"team"}
                        key={item.league}
                        league={item.league}
                        items={item.games}
                        widthScreen={SCREEN_WIDTH}
                    />
                );
            }
        }

        if (hasComponentItems) {
            // New logic: Render the component directly from the `componentItems` array
            return componentItems[index] || null;
        }

        return null; // Should not happen if dataSource is managed correctly
    }, [theme, navigation, hasData, hasComponentItems, componentItems]); // Add new dependencies

    const [refreshing, setRefreshing] = React.useState(false);
    
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <Animated.FlatList
            // Use the new dynamic dataSource and keyExtractor
            data={dataSource}
            renderItem={renderItem}
            ref={(ref: any) => {
                if (ref) flatListRefs.current.set(pageIndex, ref);
            }}
            style={{ maxWidth: SCREEN_WIDTH, paddingTop: 312, paddingHorizontal: pageIndex === 0 ? 16 : 0 }}
            contentContainerStyle={{paddingBottom: pageIndex === 0 ?  32: 0}}
            initialNumToRender={pageIndex != 1 ? 1 : 1}
            windowSize={4}
            updateCellsBatchingPeriod={50}
            refreshControl={
                <RefreshControl tintColor={colors.text[theme].primary} progressViewOffset={290} refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={() => (
                <>
                    {HeaderComponent && (
                        <HeaderComponent />
                    )}
                </>
            )}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
        />
    );
});

const getLeagueId = (leagueName: string): string => {
    switch (leagueName) {
        case "Senior Girls Field Hockey":
            return "8";
        case "Varsity Boys Baseball":
            return "26";
        case "Junior Boys Football":
            return "1";
        case "Senior Boys Football":
            return "2";
        default:
            return "26";
    }
}

const getSchoolId = (schoolName: string): string => {
    switch (schoolName) {
        case "Assumption":
            return "1";
        case "Bishop Reding":
            return "2";
        case "Christ the King":
            return "3";
        case "Holy Trinity":
            return "4";
        case "Corpus Christi":
            return "5";
        case "St. Francis Xavier":
            return "6";
        case "Notre Dame":
            return "7";
        case "St. Ignatius of Loyola":
            return "8";
        case "St. Thomas Aquinas":
            return "9";
        default:
            return "1";
    }
}

const League = () => {
    const { authUser, theme } = useAuthContext();
    const [follow, setFollow] = useState<boolean>(false);
    const mainScrollY = useSharedValue(0); // Renamed to mainScrollY
    const flatListRefs = useRef(new Map());
    const pagerScrollX = useSharedValue(0); // To track the horizontal scroll of the main Pager
    const pagerRef = useRef<Animated.ScrollView>(null);

    const route = useRoute<GameRouteProp>();
    const {
        team,
        league,
        org
    }: {
        team: string, league: string, org: string
    } = route.params;

    const handleTabPress = useCallback((index: number) => {
        const targetX = index * SCREEN_WIDTH;
        pagerRef.current?.scrollTo({ x: targetX, animated: true });
        pagerScrollX.value = targetX;
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
            // Corrected logic: only sync other tabs
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
    }, []); // Empty dependency array

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
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            mainScrollY.value,
            [0, HEADER_MAX_HEIGHT / 2, HEADER_MAX_HEIGHT],
            [1, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateY }],
            opacity,
        };
    });

    const groupedDataByDay = useMemo(() => {
        // 1. Flatten the weeklyGames array into a single list of all games.
        const allGames: gameType[] = (leagueGames ?? []).flat();

        // 2. Group all the games into past and upcoming categories.
        const pastGames: gameType[] = [];
        const upcomingGames: gameType[] = [];

        allGames.forEach(game => {
            if (game.home.score !== null && game.visitor.score !== null) {
                pastGames.push(game);
            } else {
                upcomingGames.push(game);
            }
        });

        // 3. Create the final structured array for the FlatList.
        const groupedData: groupedGameStatus[] = [];

        if (pastGames.length > 0) {
            groupedData.push({
                league: "Past Games",
                games: pastGames
            });
        }

        if (upcomingGames.length > 0) {
            groupedData.push({
                league: "Upcoming Games",
                games: upcomingGames
            });
        }

        return groupedData;
    }, [leagueGames]);
    
    const AnimatedHeaderContainer = React.memo(({ animatedHeaderHeight, children }: { animatedHeaderHeight: any, children: React.ReactNode }) => {
        return (
            <Animated.View style={[animatedHeaderHeight, { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }]}>
                {children}
            </Animated.View>
        );
    });

    const pages = [0, 1];

    const contentContainerStyles = React.useMemo(() => ({
        width: SCREEN_WIDTH * pages.length,
    }), [SCREEN_WIDTH, pages.length]);

    const TABS = ['Games', 'Standings'];

    React.useEffect(() => {
        // Start prefetching when the component mounts
        Image.prefetch(Image.resolveAssetSource(brLogo).uri);
        Image.prefetch(Image.resolveAssetSource(stfxLogo).uri);
    }, []);

    const { data, error, isLoading } = useSWR(`games-${team}-${league}`, () => fetchGames(getSchoolId(team), getLeagueId(league)), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 0,
    });

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
            <StatusBar
                translucent={true}
                backgroundColor="transparent" // overlays content
                barStyle="light-content"
            />
            <View style={{ backgroundColor: colors.schools[team as school]['light'].primary, flex: 1, paddingTop: 48 }}>
                <View style={{ backgroundColor: colors.background[theme].general }}>
                    <View style={{ backgroundColor: colors.schools[team as school]['light'].primary, position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
                        <AnimatedHeaderContainer animatedHeaderHeight={animatedHeaderHeight}>
                            <DynamicStickHeader stickyHeaderAnim={stickyHeaderAnim} label={team} subNote='' mode={'team'} theme={'dark'} />
                            <TeamBanner animatedSchool={animatedSchool} label={team} subNote={league} />
                            <DynamicTabs
                                tabs={TABS}
                                currentPage={currentPage}
                                onTabPress={handleTabPress} theme={'dark'}
                            />
                        </AnimatedHeaderContainer>
                    </View>

                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        scrollEventThrottle={16}
                        style={{ paddingTop: 0, backgroundColor: theme === 'dark' ? colors.background[theme].general : colors.background[theme].alternate }}
                        removeClippedSubviews={true} // <--- Set this definitively
                        ref={pagerRef} // Keep the ref
                        // This onScroll handler only detects user-initiated horizontal scrolls
                        onScroll={useAnimatedScrollHandler((event) => {
                            // Only update pagerScrollX when the user is actively scrolling horizontally
                            // This prevents it from fighting with programmatic scrollTo
                            pagerScrollX.value = event.contentOffset.x;
                        })}
                        // MODIFICATION END
                        contentContainerStyle={contentContainerStyles} // Use the memoized/stable reference
                    >
                        <View style={{ width: SCREEN_WIDTH }}>
                            {
                                groupedDataByDay && (
                                    <MyFlatList
                                        theme={theme}
                                        teamName={team as school}
                                        data={groupedDataByDay}
                                        pageIndex={0}
                                        mainScrollY={mainScrollY}
                                        currentActivePageIndex={currentPage}
                                        flatListRefs={flatListRefs}
                                        syncTabs={syncTabs}
                                    />
                                )
                            }
                            {isLoading && false && (
                                <View style={{ paddingTop: 320, width: '100%', display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size={'large'} />
                                    <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Loading games...</Text>
                                </View>
                            )}
                            {error && (
                                <View style={{ paddingTop: 320, width: '100%', display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size={'large'} />
                                    <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Please try again, an error occured.</Text>
                                </View>
                            )}
                        </View>
                        <MyFlatList
                            key={1}
                            teamName={team as school}
                            theme={theme}
                            data={null}
                            pageIndex={1}
                            mainScrollY={mainScrollY}
                            currentActivePageIndex={currentPage}
                            flatListRefs={flatListRefs}
                            syncTabs={syncTabs}
                            componentItems={[
                                <Standings league={league} focus={team as school} />
                            ]}
                        />
                    </Animated.ScrollView>
                </View>
            </View>
        </>
    )
}

export default League