import React, { useRef, useState, useCallback, useMemo } from 'react'
import { View, Text, useColorScheme, FlatList, TouchableOpacity, Image, RefreshControl, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Pressable, Appearance, Linking, Platform } from 'react-native'
import colors from '../../colors';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeStackParamList } from '../../navigation';
import { Extrapolate, interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, useAnimatedReaction, Extrapolation } from 'react-native-reanimated';
import Animated from 'react-native-reanimated'
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
import { weeklyGames } from '../../mocks/sports';
import { gameType } from '../../types/Games';
import { weekGames } from './components/fetchers/weekGames';
import { getScores, ScoresParams } from './components/fetchers/master';
import MySchoolCard from './components/MySchoolCard';
import { asLogo, brLogo, ctkLogo, ndLogo, stfxLogo, stkLogo } from '../../../assets';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    // Month is 0-indexed, so add 1 and pad with '0'
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // Pad day with '0'
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
    currentActivePageIndex: SharedValue<number>;
    dateString: string;
    schoolToday: boolean;
    onRefreshRequest: () => Promise<any>;
}

export type RawInputRecord = {
    league?: string;
    notes: string;
    schools: string[];
    scores: { home: number | null; visitor: number | null; };
    sets?: {
        home: number[],
        visitor: number[]
    }
    time?: string;
    location?: string;
    date?: string;
}

// Type matching your desired OUTPUT structure
export type groupedLeagueType = {
    league: string;
    games: gameType[]; // Array of the transformed gameType objects
}

export type inputRecordType = Partial<gameType> & {
    league?: string; // All properties are optional, only 'league' is needed for the header
}

const getSchoolName = (school: string) => {
    switch (school) {
        case "STFX":
            return "St. Francis Xavier"
        default:
            return "";
    }
}

const HEADER_MAX_HEIGHT = 173;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const MyFlatList = React.memo(({
    data,
    authUser,
    theme,
    componentItems,
    HeaderComponent,
    pageIndex,
    dateString,
    schoolToday,
    onRefreshRequest
}: MyFlatListProps) => {
    const navigation = useNavigation<HomeStackParamList>();
    const todayFormatted = getFormattedDate(new Date());
    let todayCard = false;
    const hasData = data && data.length > 0;
    const hasComponentItems = !hasData && componentItems && componentItems.length > 0;
    const tempSchool = authUser?.school ? authUser.school : ""

    const dataSource = hasData
        ? data
        : (hasComponentItems ? componentItems.map((_, index) => ({ _internalId: index })) : []);

    dataSource.forEach((item: any) => {
        item.games.forEach((game: any) => {
            if (game.home.name.includes(getSchoolName(tempSchool)) || game.visitor.name.includes(getSchoolName(tempSchool))) {
                todayCard = true;
            }
        })
    })

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
                        date={dateString}
                        homePage={true}
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
        await onRefreshRequest();
        setRefreshing(false);
    }, []);

    return (
        <Animated.FlatList
            data={dataSource}
            renderItem={renderItem}
            keyExtractor={(item, index) => {
                return item.league || `item-${index}`;
            }}
            style={{ maxWidth: SCREEN_WIDTH, paddingTop: authUser ? 100 : 200 }}
            initialNumToRender={5}
            windowSize={5}
            refreshControl={
                <RefreshControl tintColor={colors.text[theme].primary} progressViewOffset={authUser ? 120 : 200} refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{paddingBottom: Platform.OS === 'android' ? 200 : 40, paddingHorizontal: 8, paddingTop: 24}}
            updateCellsBatchingPeriod={30}
            ListHeaderComponent={() => (
                <>
                    {HeaderComponent && (
                        <HeaderComponent />
                    )}
                    {/* authUser?.school && dateString === todayFormatted && todayCard && */}
                    {/* {authUser?.school && (
                        <MySchoolCard school={authUser.school} />
                    )} */}
                    {
                        !(data && data.length > 0) && (
                            <View style={{ height: '90%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <NoResults
                                    theme={theme}
                                    empty={false}
                                    mainLabel={pageIndex === 0 ? ("No games scheduled")
                                        : pageIndex === 6 ? ("No games scheduled")
                                            : ("No games scheduled")}
                                    subLabel={'Maybe try a different day'}
                                />
                            </View>
                        )
                    }
                </>
            )}
            scrollEventThrottle={16}
            removeClippedSubviews={false}
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
    const [dateFlag, setDateFlag] = useState<boolean>(false);
    const [schoolTodayFlag, setSchoolTodayFlag] = useState<boolean>(false);

    const initialPage = 7;
    const initialOffset = initialPage * SCREEN_WIDTH;
    const initialOffsetRef = useRef(initialOffset);
    const pagerScrollX = useSharedValue(initialOffset);

    const [dateSearch, setDateSearch] = useState<Date>(new Date());
    const [organizedData, setOrganizedData] = useState<groupedLeagueType[] | null>(null);
    
    const handleTabPress = useCallback((index: number) => {
        const targetX = index * SCREEN_WIDTH;
        pagerRef.current?.scrollTo({ x: targetX, animated: true });
    }, []);

    const currentPage = useDerivedValue(() => {
        return Math.round(pagerScrollX.value / SCREEN_WIDTH);
    });

    const updateDateForPage = useCallback((newPageIndex: number) => {
        // Start from today's date (which is the initial date when the component mounted)
        const today = new Date();

        const dateDiff = newPageIndex - initialPage;

        const newDate = new Date(today);
        newDate.setDate(newDate.getDate() + dateDiff);

        // Update the date state
        setDateSearch(newDate);
    }, [initialPage]);


    useAnimatedReaction(
        () => {
            // 1. Listen to changes in the current page index
            return currentPage.value;
        },
        (newPage, oldPage) => {
            // 2. Only run the update when the page has settled on a different index
            if (newPage !== null && newPage !== oldPage) {
                // 3. Execute the date state update on the JavaScript thread
                runOnJS(updateDateForPage)(newPage);
            }
        },
        // Dependency array ensures this hook knows about updateDateForPage
        [updateDateForPage]
    );

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

    const {
        data: gamesData,
        error,
        isLoading,
        mutate // <-- Destructure mutate from useSWR
    } = useSWR(
        // Key depends on dateSearch changing
        ['games', dateSearch],
        // Fetcher receives the date object from the SWR key array
        ([key, date]) => fetcher(dateSearch),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const groupGamesByLeague = (gamesData: RawInputRecord[]): groupedLeagueType[] => {
        if (!gamesData) return [];

        const groupedData: Record<string, groupedLeagueType> = {};
        let currentLeague: string | undefined = undefined;

        gamesData.forEach(rawRecord => {
            let leagueName = rawRecord.league;

            if (leagueName) {
                currentLeague = leagueName;
            } else if (currentLeague) {
                leagueName = currentLeague;
            }

            // Skip missing leagues and anything elementary-level.
            if (!leagueName || /elementary/i.test(leagueName)) {
                return;
            }

            const isCompleteGame = rawRecord.schools?.length === 2 && rawRecord.scores;

            if (isCompleteGame) {

                const transformedGame: gameType = {
                    league: leagueName,
                    notes: rawRecord.notes,
                    time: rawRecord.time,
                    date: rawRecord.date,
                    location: rawRecord.location,
                    home: {
                        name: rawRecord.schools[0],
                        score: rawRecord.scores.home,
                    },
                    visitor: {
                        name: rawRecord.schools[1],
                        score: rawRecord.scores.visitor,
                    },
                    sets: {
                        home: rawRecord.sets?.home,
                        visitor: rawRecord.sets?.visitor,

                    }
                };

                if (!groupedData[leagueName]) {
                    groupedData[leagueName] = {
                        league: leagueName,
                        games: []
                    };
                }
                groupedData[leagueName].games.push(transformedGame);
            }
        });

        return Object.values(groupedData);
    };
    
    const isTrulyLoading = isLoading;

    const fetcher = useCallback(async (date: Date) => {
        const queryParams: ScoresParams = {
            // Example: Fetching scores for a specific date
            dateSelect: getFormattedDate(date),
            leagueSelect: 'ALL',
        };
        const data = await getScores(queryParams);
        return groupGamesByLeague(data as RawInputRecord[]);
    }, []);

    const memoizedSignInBanner = useMemo(() => {
        return <SignInBanner animation={animatedSchool} />;
    }, [animatedSchool]);

    const getDaysDifference = (date1: Date, date2: Date): number => {
        // Set both times to midnight to ensure accurate day comparison
        const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

        // Calculate the difference in milliseconds
        const diffTime = d1.getTime() - d2.getTime();

        // Convert to days: 1000ms * 60s * 60m * 24h
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
    };

    const TODAY_DATE_STRING = getFormattedDate(new Date());
    const REFERENCE_DATE = TODAY_DATE_STRING;
    const TOTAL_PAGES = 16;

    const handleDayChange = useCallback((selectedDateString: Date, manualFlag?: boolean) => {
        setDateSearch(selectedDateString);
        if (manualFlag) setDateFlag(true);
        else if (manualFlag === false) setDateFlag(false);

        // 1. Convert the selected string date to a Date object
        const selectedDate = new Date(selectedDateString);

        // 2. Calculate the difference in days from the reference date (2024-09-18)
        const dayDifference = getDaysDifference(selectedDate, new Date(REFERENCE_DATE));

        // 3. Calculate the target page index
        const targetPageIndex = initialPage + dayDifference;

        // 4. Validate the index to stay within the array bounds (0 to 15)
        let finalPageIndex = targetPageIndex;

        if (targetPageIndex < 0) {
            finalPageIndex = 0;
            console.warn("Attempted to scroll before the first day.");
        } else if (targetPageIndex >= TOTAL_PAGES) {
            finalPageIndex = TOTAL_PAGES - 1;
            console.warn("Attempted to scroll past the last day.");
        }

        // 5. Run the scroll animation using your existing function
        // We assume handleTabPress is already defined and correctly scrolls the pagerRef.
        handleTabPress(finalPageIndex);

    }, [handleTabPress, initialPage]);

    React.useEffect(() => {
        // Start prefetching when the component mounts
        Image.prefetch(Image.resolveAssetSource(brLogo).uri);
        Image.prefetch(Image.resolveAssetSource(stfxLogo).uri);
        Image.prefetch(Image.resolveAssetSource(ctkLogo).uri);
        Image.prefetch(Image.resolveAssetSource(asLogo).uri);
        Image.prefetch(Image.resolveAssetSource(stfxLogo).uri);
        Image.prefetch(Image.resolveAssetSource(stkLogo).uri);
        Image.prefetch(Image.resolveAssetSource(ndLogo).uri);
    }, []);

    const handleRedirect = () => {
        Linking.openURL('https://hcaa.ca').catch(err => console.error("Couldn't load page", err));
    };

    return (
        <>
            <StatusBar translucent={true} style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background[theme].elevated} />
            <SafeAreaView edges={['left', 'right', 'top']} style={{ backgroundColor: colors.background[theme].elevated, flex: 1, flexGrow: 1, height: '100%' }}>
                <View style={{ backgroundColor: colors.background[theme].alternate, height: '100%' }}>
                    <View style={{ position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
                        <Animated.View style={[animatedHeaderHeight, { display: 'flex', flexDirection: 'column' }]}>
                            {!authUser && memoizedSignInBanner}
                            <StickHeader
                                authUser={authUser}
                                currentPage={currentPage}
                                onTabPress={handleTabPress}
                                onDayPress={handleDayChange}
                                dateSearch={dateSearch}
                                manualDate={dateFlag ? dateSearch : undefined}
                            />
                        </Animated.View>
                    </View>

                    {error && (
                        <View style={{ paddingVertical: 60, paddingTop: 160, width: '100%', display: 'flex', alignItems: 'center', paddingHorizontal: 48 }}>
                            <Ionicons name="alert-circle-outline" color={colors.text[theme].secondary} size={56} />
                            <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Bold', fontSize: 17, textAlign: 'center', marginTop: 8 }}>Oops, there's an error</Text>
                            <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Regular', fontSize: 15, lineHeight: 20, textAlign: 'center' }}>We've had an unexpected error, please try again later later or check</Text>
                            <TouchableOpacity onPress={handleRedirect} style={{  }}>
                                <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Bold', fontSize: 15, lineHeight: 20, textDecorationLine: 'underline' }}>HCAA.ca</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {
                        isTrulyLoading && !error ? (
                            <View style={{ paddingTop: authUser ? 140 : 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={colors.text[theme].primary} />
                            </View>
                        ) : !error && (
                            <MyFlatList
                                theme={theme}
                                dateString={getFormattedDate(dateSearch)}
                                key={getFormattedDate(dateSearch)} // Use the date as the key to force component reset if needed
                                data={gamesData ? gamesData : null} // Directly use the organized data from SWR
                                authUser={authUser}
                                pageIndex={currentPage.value} // Use the current page index
                                currentActivePageIndex={currentPage}
                                schoolToday={schoolTodayFlag}
                                onRefreshRequest={mutate}
                            />
                        )
                    }
                </View>
            </SafeAreaView>
        </>
    )
}

export default Sports