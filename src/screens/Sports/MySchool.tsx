import React, { useCallback, useState } from 'react'
import { Text, View, Image, Modal, TouchableOpacity, Platform, Pressable, Animated, RefreshControl, Dimensions, FlatList, ScrollView, ActivityIndicator } from 'react-native'
import { AuthContextType, AuthUserCustomType, useAuthContext } from '../../contexts/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';
import { MeshGradientView } from 'expo-mesh-gradient';
import ProfileGen from '../../components/ProfileGen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation';
import { getScores, ScoresParams } from './components/fetchers/master';
import { RawInputRecord } from '.';
import useSWR from 'swr';
import { getSchoolId } from './Team';
import { gameType } from '../../types/Games';
import { SharedValue } from 'react-native-reanimated';
import { LeagueGame } from './components/LeagueGame';
import NoResults from './components/NoResults';
import { LinearGradient } from 'expo-linear-gradient';

const getSchoolName = (school?: string) => {
    switch (school) {
        case "STFX":
            return "St. Francis Xavier"
        default:
            return undefined;
    }
}

type GameLocationOnly = {
    home: gameType[];
    away: gameType[];
};

const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    // Month is 0-indexed, so add 1 and pad with '0'
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // Pad day with '0'
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MySchool = () => {
    const { authUser, updateAuthUser, updateSchool, theme }: AuthContextType = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const tempSchool = getSchoolName(authUser?.school);

    const schoolAbrv = {
        "AS": "Assumption",
        "BR": "Bishop Reding",
        "CTK": "Christ the King",
        "CC": "Corpus Christi",
        "HT": "Holy Trinity",
        "ND": "Notre Dame",
        "STFX": "St. Francis Xavier",
        "SKT": "St. Kateri Tekakwitha",
        "LOY": "St. Ignatius of Loyola",
        "STA": "St. Thomas Aquinas"
    } as const

    const schoolData = [
        {
            name: 'Assumption',
            abbrev: 'asu'
        },
        {
            name: 'Bishop P.F. Reding',
            abbrev: 'br'
        },
        {
            name: 'Christ the King',
            abbrev: 'ctk'
        },
        {
            name: 'Corpus Christi',
            abbrev: 'cc'
        },
        {
            name: 'Holy Trinity',
            abbrev: 'ht'
        },
        {
            name: 'Notre Dame',
            abbrev: 'nd'
        },
        {
            name: 'St. Francis Xavier',
            abbrev: 'stfx'
        },
        {
            name: 'St. Kateri Takakwitha',
            abbrev: 'skt'
        },
        {
            name: 'St. Ignatius of Loyola',
            abbrev: 'loy'
        },
        {
            name: 'St. Thomas Aquinas',
            abbrev: 'sta'
        }
    ];

    const groupGamesByLocation = (
        gamesData: RawInputRecord[],
        targetSchoolName: string // The school to check against (e.g., "St. Francis Xavier")
    ): GameLocationOnly => {

        if (!gamesData || !targetSchoolName) {
            return { home: [], away: [] };
        }

        // Initialize the final result structure immediately
        const groupedData: GameLocationOnly = {
            home: [],
            away: []
        };

        let currentLeague: string | undefined = undefined;

        gamesData.forEach(rawRecord => {
            let leagueName = rawRecord.league;

            // --- League Name Logic (Kept for transformation but not for grouping) ---
            if (leagueName) {
                currentLeague = leagueName;
            } else if (currentLeague) {
                leagueName = currentLeague;
            }
            if (!leagueName) {
                // Must have a league for the final gameType structure
                return;
            }

            const isCompleteGame = rawRecord.schools?.length === 2 && rawRecord.scores;

            if (isCompleteGame) {
                const homeSchoolName = rawRecord.schools![0];
                const visitorSchoolName = rawRecord.schools![1];

                // Only process games that involve the target school
                const isTargetSchoolInGame = homeSchoolName === targetSchoolName || visitorSchoolName === targetSchoolName;
                if (!isTargetSchoolInGame) {
                    return;
                }

                // --- Game Transformation ---
                const transformedGame: gameType = {
                    league: leagueName,
                    notes: rawRecord.notes,
                    time: rawRecord.time,
                    date: rawRecord.date,
                    location: rawRecord.location ?? '',
                    home: {
                        name: homeSchoolName,
                        score: rawRecord.scores!.home,
                    },
                    visitor: {
                        name: visitorSchoolName,
                        score: rawRecord.scores!.visitor,
                    },
                    sets: {
                        home: rawRecord.sets?.home,
                        visitor: rawRecord.sets?.visitor,
                    }
                };

                // --- Grouping by Home/Away ---
                if (homeSchoolName === targetSchoolName) {
                    // The target school is the home team
                    groupedData.home.push(transformedGame);
                } else {
                    // The target school is the visiting (away) team
                    groupedData.away.push(transformedGame);
                }
            }
        });

        return groupedData;
    };

    const { data: schoolGames, error, isLoading } = useSWR(
        // Key depends on dateSearch changing
        ['mySchoolGames'],
        // Fetcher receives the date object from the SWR key array
        ([key]) => fetcher(getSchoolName(authUser?.school)),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const fetcher = useCallback(async (school?: string) => {
        if (school) {
            const queryParams: ScoresParams = {
                dateSelect: getFormattedDate(new Date()),
                schoolSelect: getSchoolId(school),
            };
            const data = await getScores(queryParams);
            const temp = groupGamesByLocation(data as RawInputRecord[], school);
            console.log(temp);
            return temp;
        } else {
            return null;
        }
    }, []);

    return (
        <>
            {tempSchool && (
                <LinearGradient
                    colors={[colors.schools[tempSchool][theme].secondary, colors.background[theme].alternate]}
                    start={{ x: 0, y: 0 }} // Top center
                    end={{ x: 0, y: 1 }}
                    style={{ width: '100%', height: 300, position: 'absolute' }}
                />
            )}
            <SafeAreaView edges={["top"]} style={{
                position: 'relative', height: '100%',
                paddingHorizontal: 8
            }}>
                <Pressable onPress={() => {}} style={{  }}>
                    <View style={{
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                        alignItems: 'center', paddingHorizontal: 12, width: '100%', paddingVertical: 16,
                    }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
                            <Ionicons name='chevron-back-outline' size={32} color={colors.text[theme].primary} />
                        </TouchableOpacity>
                    </View>
                </Pressable>

                
                <ScrollView>
                    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBlock: 16 }}>
                        <Text style={{ fontFamily: "Figtree-Medium", fontSize: 17, color: colors.text[theme].secondary, marginBottom: 4 }}>Happening today, at</Text>
                        <Text style={{ fontFamily: "Figtree-Bold", fontSize: 28, color: colors.text[theme].primary }}>{getSchoolName(authUser?.school ? authUser.school : "error")}</Text>
                    </View>
                    {
                        isLoading && (
                            <View style={{marginTop: 40}}>
                                <ActivityIndicator size={"large"} color={colors.text[theme].primary} />
                                <Text style={{
                                    textAlign: 'center', marginTop: 12, color: colors.text[theme].secondary,
                                    fontSize: 16, fontFamily: 'Figtree-SemiBold'
                                }}>Loading games...</Text>
                            </View>
                        )
                    }
                    {
                        error && (
                            <View style={{ marginTop: 40 }}>
                                <Ionicons name='alert-circle-outline' size={42} style={{alignSelf: 'center', color: colors.text[theme].secondary}}  />
                                <Text style={{
                                    textAlign: 'center', marginTop: 12, color: colors.text[theme].secondary,
                                    fontSize: 16, fontFamily: 'Figtree-SemiBold'
                                }}>Error, please try again.</Text>
                            </View>
                        )
                    }
                    {
                        schoolGames?.home && schoolGames.home.length > 0 && (
                            <LeagueGame
                                league={"Home"}
                                items={schoolGames?.home ?? []}
                                widthScreen={SCREEN_WIDTH}
                                teamName={'St. Francis Xavier'}
                                mode={'school'}
                            />
                        )
                    }
                    {
                        schoolGames?.away && schoolGames.away.length > 0 && (
                            <LeagueGame
                                league={"Away"}
                                items={schoolGames?.away ?? []}
                                widthScreen={SCREEN_WIDTH}
                                teamName={'St. Francis Xavier'}
                                mode={'school'}
                            />
                        )
                    }
                </ScrollView>
            </SafeAreaView>
        </>
    )
}

export default MySchool