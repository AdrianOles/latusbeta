import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { View, Text, useColorScheme, FlatList, TouchableOpacity, Image, RefreshControl, StatusBar, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Platform } from 'react-native'
import colors from '../../colors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation';
import { Extrapolate, interpolate, runOnJS, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
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
import { groupedLeagueType, RawInputRecord, school } from '.';
import TeamInfo from './components/TeamInfo';
import { leagueGames } from '../../mocks/sports';
import { useAuthContext } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { LeagueGame } from './components/LeagueGame';
import { getScores, ScoresParams } from './components/fetchers/master';
import { format } from 'date-fns';
import { SkeletonGameCard } from './components/SkeletonGameCard';
import Svg, { Path } from 'react-native-svg';
import { getSchoolId } from './components/fetchers/getSchoolId';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Define MyFlatList as a separate component outside of Testrun
interface MyFlatListProps {
    data: groupedGameStatus[] | null;
    componentItems?: React.ReactElement[];
    HeaderComponent?: React.ComponentType<any>;
    pageIndex: number;
    teamName: school;
    theme: 'light' | 'dark';
    mainScrollY: SharedValue<number>;
    currentActivePageIndex: SharedValue<number>;
    flatListRefs: React.MutableRefObject<Map<number, any>>;
    syncTabs: (index: number, scrollY: number) => void;
    onRefreshRequest: () => Promise<any>;
}

export type groupedGameStatus = {
    league: string;
    games: gameType[];
}

const HEADER_MAX_HEIGHT = 280; // Define or pass down if needed for calculations
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
type GameRouteProp = RouteProp<HomeStackParamList, 'Team'>;

export function convertFullDateToISO(fullDate: string): string | null {
    const datePartsString = fullDate.split(',').slice(1).join(',').trim();
    const match = datePartsString.match(/([A-Za-z]+)\s*(\d+),\s*(\d{4})/);

    if (!match) return null;

    const [, monthName, dayStr, yearStr] = match;
    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    const monthIndex = monthNames.indexOf(monthName.toLowerCase());

    if (monthIndex === -1) return null;

    const year = parseInt(yearStr, 10);
    const day = parseInt(dayStr, 10);

    const date = new Date(year, monthIndex, day);

    if (!isNaN(date.getTime()) && date.getFullYear() === year) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayFormatted = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${dayFormatted}`;
    }
    return null;
}

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
    onRefreshRequest
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
    
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await onRefreshRequest();
        setRefreshing(false);
    }, []);

    return (
        <Animated.FlatList
            // Use the new dynamic dataSource and keyExtractor
            data={dataSource}
            renderItem={renderItem}
            ref={(ref: any) => {
                if (ref) flatListRefs.current.set(pageIndex, ref);
            }}
            style={{ maxWidth: SCREEN_WIDTH, paddingTop: 312, paddingHorizontal: pageIndex === 0 ? 8 : 0 }}
            contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 400 : 40, paddingHorizontal: pageIndex === 1 ? 8 : 0 }}
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
            ListEmptyComponent={() => (
                <View style={{ paddingVertical: 60, width: '100%', display: 'flex', alignItems: 'center', paddingHorizontal: 32 }}>
                    <Ionicons name="time-outline" color={colors.text[theme].secondary} size={56} />
                    <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Bold', fontSize: 17, textAlign: 'center', marginTop: 8 }}>No games here</Text>
                    <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Regular', fontSize: 15, lineHeight: 20, textAlign: 'center' }}>Please check again later, scheduled games will be added closer to the season</Text>
                </View>
            )}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
        />
    );
});

export const getLeagueId = (leagueName: string): string => {
    switch (leagueName) {
        case "Varsity Boys Baseball":
            return "XIe07x0pjT4sCCBh"
        case "Junior Girls Basketball":
            return "QBx6I6iG0MdZAx8R"
        case "Senior Girls Basketball":
            return "X75JR6J83JNHEp2I"
        case "Junior Girls Field Hockey":
            return "biwtTVoCIhx5q3jq"
        case "Senior Girls Field Hockey":
            return "t2je0DByW7UGk9XI"
        case "Junior Boys Football":
            return "HPnoqpYahXjVj3em"
        case "Senior Boys Football":
            return 'Fmmth77bLBTSKFuF'
        case "Varsity Co-Ed Ultimate":
            return '28'
        case "Junior Boys Volleyball":
            return "312LCksejUyaAUUo"
        case "Senior Boys Volleyball":
            return "YSkMUWgt8C0LhUKk"
        case "Novice Boys Basketball":
            return "9"
        case "Junior Boys Basketball":
            return "10"
        case "Senior Boys Basketball":
            return "11"
        case "Novice Co-Ed Curling":
            return "29"
        case "Varsity Boys Curling":
            return "15"
        case "Varsity Girls Curling":
            return "16"
        case "Varsity Boys Hockey":
            return "17"
        case "Varsity Girls Hockey":
            return "18"
        case "Novice Girls Volleyball":
            return "12"
        case "Junior Girls Volleyball":
            return "13"
        case "Senior Girls Volleyball":
            return "14"
        case "Tier 1 Varsity Co-Ed eSports":
            return "30"
        case "Tier 2 Varsity Co-Ed eSports":
            return "31"
        case "Varsity Girls Fastpitch":
            return "25"
        case "Varsity Boys Lacrosse":
            return "a0BRQWBVYDoPNf9T"
        case "Varsity Girls Lacrosse":
            return "32"
        case "Senior Girls Rugby":
            return "24"
        case "Varsity Girls Slowpitch":
            return "27"
        case "Junior Boys Soccer":
            return "19"
        case "Senior Boys Soccer":
            return "20"
        case "Junior Girls Soccer":
            return "21"
        case "Senior Girls Soccer":
            return "22"
        default:
            return "26";
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

    const groupedDataByStatus = (data: RawInputRecord[]): groupedGameStatus[] => {
        if (!data || data.length === 0) {
            return [];
        }

        // 1. Transform RawInputRecord[] to gameType[]
        const transformedGames: gameType[] = data.map(record => {
            let formattedDate: string | undefined = undefined;

            // --- Corrected Date Formatting Logic ---
            if (record.date) {
                try {
                    let dateObj: Date | undefined;

                    if (/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
                        // FIX: Split YYYY-MM-DD to force local timezone parsing and avoid the 1-day-behind bug
                        const [year, month, day] = record.date.split('-');
                        dateObj = new Date(Number(year), Number(month) - 1, Number(day)); // Month is 0-indexed
                    }
                    else if (/^[A-Za-z]{3}\s\d{1,2}$/.test(record.date)) {
                        // "Nov 24" format naturally parses in the local timezone
                        dateObj = new Date(record.date);
                    }
                    else {
                        // Handle complex full date string
                        const isoDate = convertFullDateToISO(record.date);
                        if (isoDate) {
                            // Extract just the YYYY-MM-DD part before parsing
                            const datePart = isoDate.split('T')[0];
                            const [year, month, day] = datePart.split('-');
                            dateObj = new Date(Number(year), Number(month) - 1, Number(day));
                        }
                    }

                    if (dateObj && !isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                } catch (e) {
                    // Keep formattedDate as undefined on failure
                }
            }
            // --- End Date Formatting Logic ---

            return {
                date: formattedDate,
                league: record.league || 'Unknown League',
                location: record.location,
                notes: record.notes,
                time: record.time,
                home: {
                    name: record.schools[0] || 'Home Team',
                    score: record.scores.home
                },
                visitor: {
                    name: record.schools[1] || 'Visitor Team',
                    score: record.scores.visitor
                },
                sets: record.sets
                    ? { home: record.sets.home, visitor: record.sets.visitor }
                    : undefined
            };
        });

        // 2. Separate into Upcoming and Past categories
        const upcomingGames: gameType[] = [];
        const pastGames: gameType[] = [];

        transformedGames.forEach(game => {
            const hasScores = game.home.score !== null && game.visitor.score !== null;
            const isPending = game.time?.toLowerCase().includes('pending') ?? false;

            // A game is 'Past' if it has scores OR if its time field includes 'pending'.
            if (hasScores || isPending) {
                pastGames.push(game);
            } else {
                // All other games are Upcoming.
                upcomingGames.push(game);
            }
        });

        // Sort function
        const sortGames = (a: gameType, b: gameType, isPast: boolean) => {
            const dateA = a.date || (isPast ? '1900-01-01' : '3000-01-01');
            const dateB = b.date || (isPast ? '1900-01-01' : '3000-01-01');

            const dateObjA = new Date(dateA.includes(' ') ? `${dateA}, ${new Date().getFullYear()}` : dateA);
            const dateObjB = new Date(dateB.includes(' ') ? `${dateB}, ${new Date().getFullYear()}` : dateB);

            return dateObjA.getTime() - dateObjB.getTime();
        };

        // Sort Upcoming chronologically
        upcomingGames.sort((a, b) => sortGames(a, b, false));
        // Sort Past reverse chronologically (most recent first)
        pastGames.sort((a, b) => sortGames(b, a, true));

        // 3. Create the final structured array with only two groups
        const groupedData: groupedGameStatus[] = [];

        if (upcomingGames.length > 0) {
            groupedData.push({
                league: "Upcoming Games",
                games: upcomingGames
            });
        }

        if (pastGames.length > 0) {
            groupedData.push({
                league: "Past Games",
                games: pastGames
            });
        }

        return groupedData;
    };

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

    const { data: teamGames, error, isLoading, mutate } = useSWR(
        // Key depends on dateSearch changing
        [`teamGames+${team}`, team],
        // Fetcher receives the date object from the SWR key array
        ([key, team]) => fetcher(team),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const [minTimeLoading, setMinTimeLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinTimeLoading(false);
        }, 200); // Wait 500 milliseconds (adjust as needed)

        // Cleanup the timer if the component unmounts
        return () => clearTimeout(timer);
    }, []);

    const isTrulyLoading = isLoading || minTimeLoading;

    const fetcher = useCallback(async (team: string) => {
        const queryParams: ScoresParams = {
            // Example: Fetching scores for a specific date
            dateSelect: 'ALL',
            leagueSelect: getLeagueId(league),
            schoolSelect: getSchoolId(team, getLeagueId(league)) ?? undefined,
        };
        const data = await getScores(queryParams);
        return groupedDataByStatus(data as RawInputRecord[]);
    }, []);

    const stickyHeaderAnim = useAnimatedStyle(() => {
        const opacity = interpolate(
            mainScrollY.value,
            [0, HEADER_MAX_HEIGHT / 2], // Adjust range to match pull amount
            [0, 1],
            Extrapolate.CLAMP
        )

        return {
            opacity
        }
    });

    const createSkeletonGroup = (leagueName: string, count: number): groupedGameStatus => {
        // We create dummy objects with a unique identifier like '_isSkeleton'
        const skeletonGames = Array.from({ length: count }).map((_, index) => ({
            // Use '_isSkeleton' or a missing required property to identify it later
            _isSkeleton: true,
            _id: `${leagueName}-skeleton-${index}`,
            // Fill out required properties minimally to satisfy TypeScript/structure
            notes: '',
            home: { name: '', score: null },
            visitor: { name: '', score: null }
        } as gameType & { _isSkeleton: boolean, _id: string }));

        return {
            league: leagueName,
            games: skeletonGames,
        };
    };

    const renderData = useMemo(() => {
        // 1. If data is ready AND minimum time is over, show real data
        if (teamGames && !isTrulyLoading) {
            return teamGames;
        }

        // 2. If loading OR minTimeLoading is active AND real data isn't ready, show skeletons.
        if (isTrulyLoading && !teamGames) {
            // Estimate the number of items needed for a good initial view
            // Create 2 groups: one for upcoming (3 items) and one for past (3 items)
            return [
                createSkeletonGroup("Upcoming Games", 3),
                createSkeletonGroup("Past Games", 5),
            ];
        }

        // 3. Fallback for error/no data state after loading
        return teamGames || null;

    }, [teamGames, isTrulyLoading]);

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
                            <DynamicStickHeader stickyHeaderAnim={stickyHeaderAnim} label={team} subNote='' mode={'team'} theme={'dark'} final={false} />
                            <TeamBanner animatedSchool={animatedSchool} label={team} subNote={league} />
                            <DynamicTabs
                                tabs={TABS}
                                currentPage={currentPage}
                                onTabPress={handleTabPress} theme={'dark'} final={false}
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
                                teamGames && !isTrulyLoading && (
                                    <MyFlatList
                                        theme={theme}
                                        teamName={team as school}
                                        data={renderData}
                                        pageIndex={0}
                                        mainScrollY={mainScrollY}
                                        currentActivePageIndex={currentPage}
                                        flatListRefs={flatListRefs}
                                        syncTabs={syncTabs}
                                        onRefreshRequest={mutate}

                                    />
                                )
                            }
                            {isTrulyLoading && (
                                <View style={{ paddingTop: 340, width: '100%', display: 'flex', alignContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}>
                                    <ActivityIndicator size={"large"} color={colors.text[theme].primary} />
                                    <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-SemiBold', textAlign: 'left', fontSize: 16, lineHeight: 20, color: colors.text[theme].secondary, paddingTop: 8 }}>Loading games...</Text>
                                </View>
                            )}
                            {error && (
                                <View style={{ paddingTop: 320, width: '100%', display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size={'large'} />
                                    <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Please try again, an error occured.</Text>
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
                            onRefreshRequest={mutate}
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