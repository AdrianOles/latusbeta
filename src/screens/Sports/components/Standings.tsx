import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Dimensions, ScrollView, Image, ActivityIndicator, Linking } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { useAuthContext } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import Tab from "./Tab";
import { Ionicons } from '@expo/vector-icons';
import useSWR from "swr";
import { ApiError, get } from "aws-amplify/api";
import { school } from "..";
import { useNavigation } from "expo-router";
import { HomeStackParamList } from "../../../navigation";
import { getStandings, StandingsParams } from "./fetchers/standings";
import { getLeagueId } from "../Team";
import Svg, { Path } from "react-native-svg";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

type StandingsApiResponse = {
    standings: TeamStanding[];
};

const schoolLogos = {
    "St. Thomas Aquinas": require('../../../../assets/schools/sta.png'),
    "St. Ignatius of Loyola": require('../../../../assets/schools/loy.png'),
    "Notre Dame": require('../../../../assets/schools/nd.png'),
    "Bishop Reding": require('../../../../assets/schools/br.png'),
    "Holy Trinity": require('../../../../assets/schools/ht.png'),
    "Assumption": require('../../../../assets/schools/as.png'),
    "Corpus Christi": require('../../../../assets/schools/cc.png'),
    "St. Francis Xavier": require('../../../../assets/schools/stfx.png'),
    "St. Kateri Tekakwitha": require('../../../../assets/schools/stk.png'),
    "Christ the King": require('../../../../assets/schools/ctk.png'),
};

type TeamStanding = {
    GD: number;        // Goal Difference
    GP: number;        // Games Played
    PTS: number;       // Points
    schoolId: string;  // School ID as string
    team: string;      // Team name
};

const isStandingsResponse = (data: unknown): data is StandingsApiResponse => {
    return (
        typeof data === 'object' &&
        data !== null &&
        'standings' in data &&
        Array.isArray((data as StandingsApiResponse).standings)
    );
};


const Standings = React.memo(({league, focus, home, away}: {league: string, focus?: school, home? : school, away?: school}) => {
    const { theme } = useAuthContext();
    const [highlight, setHighlight] = useState<number>(0);
    const navigation = useNavigation<HomeStackParamList>();


    const fetcher = useCallback(async () => {
        const queryParams: StandingsParams = {
            leagueid: getLeagueId(league),
        };
        const data = await getStandings(queryParams);
        return data;
    }, []);

    const { data: standingsData, error, isLoading } = useSWR(
        // Key depends on dateSearch changing
        ['standings'],
        // Fetcher receives the date object from the SWR key array
        ([key]) => fetcher(),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const handlePress = () => {
        Linking.openURL('https://hcaa.ca').catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={{
            display: 'flex', flexDirection: 'column', minWidth: SCREEN_WIDTH, maxWidth: SCREEN_WIDTH, paddingHorizontal: 8,
            paddingBottom: 72,
            backgroundColor: theme === 'dark' ? colors.background[theme].general : colors.background[theme].alternate
        }}>
            {
                isLoading && (
                    <View style={{width: '100%', display: 'flex', alignContent: 'center', alignItems: 'center', paddingBottom: 32 }}>
                        <ActivityIndicator size={'large'} />
                        <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Loading standings...</Text>
                    </View>
                )
            }
            {
                error && (
                    <View style={{ width: '100%', display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} />
                        <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 16, color: colors.text[theme].secondary, marginTop: 16 }}>Please try again, an error occured.</Text>
                    </View>
                )
            }
            {
                standingsData && !isLoading && (
                    <View style={{
                        display: 'flex', flexDirection: 'column', borderWidth: 0, alignItems: 'center', marginBottom: 24, backgroundColor: colors.background[theme].elevated,
                        borderColor: colors.fills[theme].stroke, borderRadius: 16, justifyContent: 'space-between', boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)", overflow: 'hidden'
                    }}>
                        {standingsData.length > 0 ? (
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottomWidth: 1, borderBottomColor: colors.fills[theme].stroke, padding: 16, paddingRight: 0, paddingBottom: 12 }}>
                                <Text style={{ paddingLeft: 16, fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 12, color: colors.text[theme].secondary }}>
                                    Team
                                </Text>
                                <View style={{ display: 'flex', flexDirection: 'row', paddingRight: 16 }}>
                                    {/* Use a container with a minWidth to ensure it doesn't get too cramped */}
                                    <View style={{ minWidth: 40, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: "Figtree-Regular", fontSize: 13, color: colors.text[theme].secondary, fontVariant: ['tabular-nums'], textAlign: 'right' }}>GP</Text>
                                    </View>
                                    <View style={{ minWidth: 40, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: "Figtree-Regular", fontSize: 13, color: colors.text[theme].secondary, fontVariant: ['tabular-nums'], textAlign: 'right' }}>PD</Text>
                                    </View>
                                    <View style={{ minWidth: 40, alignItems: 'center' }}>
                                        <Text style={{ fontFamily: "Figtree-Bold", fontSize: 13, color: colors.text[theme].secondary, fontVariant: ['tabular-nums'], textAlign: 'right' }}>PTS</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                                <View style={{ paddingVertical: 60, width: '100%', display: 'flex', alignItems: 'center', paddingHorizontal: 32 }}>
                                    <Ionicons name="time-outline" color={colors.text[theme].secondary} size={56} />
                                    <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Bold', fontSize: 17, textAlign: 'center', marginTop: 8}}>Season has yet to begin</Text>
                                    <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Regular', fontSize: 15, lineHeight: 20, textAlign: 'center' }}>Please check again later, scheduled games will be added closer to the season</Text>
                                </View>
                        )}
                        {
                            standingsData?.map((item, index) => {
                                const temp = item.team.replace(/\s*\([^)]*\)$/, '').trim();
                                return (
                                    <TouchableOpacity onPress={() => navigation.navigate("SportsTeam", {
                                                team: temp, league: league, org: "HCAA",
                                            })} key={index} style={{
                                        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 16,
                                        borderBottomWidth: index === (standingsData.length - 1) ? 0 : 1, borderColor: colors.fills[theme].stroke,
                                        backgroundColor: (home === temp || away === temp || focus === temp) ? colors.fills[theme].standard : 'transparent'
                                    }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 56, flex: 1 }}>
                                            <Text style={{ fontFamily: 'Figtree-ExtraBold', fontSize: 17, textAlign: 'center', color: colors.text[theme].primary, width: 20 }}>{index + 1}</Text>
                                            <View style={{height: 24, width: 24, marginLeft: 12, marginRight: 4,}}>
                                                <Image
                                                    source={schoolLogos[temp as school]}
                                                    style={{
                                                        height: '100%', width: '100%', objectFit: 'contain'
                                                    }}
                                                />
                                            </View>
                                            <View style={{ display: 'flex', alignItems: "center", justifyContent: 'center'}}>
                                                <Text numberOfLines={1} style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 16, flexShrink: 1, color: colors.text[theme].primary }}>
                                                    {item.team.replace(/\s*\([^)]*\)$/, '').trim()}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexShrink: 0, display: 'flex', flexDirection: 'row'}}>
                                            <View style={{ minWidth: 40, alignItems: 'center' }}>
                                                <Text style={{ fontFamily: "Figtree-Regular", fontSize: 15, color: colors.text[theme].primary, fontVariant: ['tabular-nums'] }}>{item.GP}</Text>
                                            </View>
                                            <View style={{ minWidth: 40, alignItems: 'center' }}>
                                                <Text style={{ fontFamily: "Figtree-Regular", fontSize: 15, color: colors.text[theme].primary, fontVariant: ['tabular-nums'] }}>{item.GD}</Text>
                                            </View>
                                            <View style={{ minWidth: 40, alignItems: 'center'}}>
                                                <Text style={{ fontFamily: "Figtree-Bold", fontSize: 15, color: colors.text[theme].primary, fontVariant: ['tabular-nums'] }}>{item.PTS}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                )
            }

            <TouchableOpacity onPress={handlePress} style={{
                display: 'flex', flexDirection: 'row', borderWidth: 0, padding: 16, paddingVertical: 20, alignItems: 'center', marginBottom: 12, backgroundColor: colors.background[theme].elevated,
                borderColor: colors.fills[theme].stroke, borderRadius: 16, justifyContent: 'space-between', boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)"
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row',
                    alignItems: 'center', flexShrink: 1
                }}>
                    <Image
                        source={require('../../../../assets/schools/hcaa.png')}
                        style={{
                            width: 28, aspectRatio: 1, marginRight: 8, objectFit: 'contain', transform: [{
                                scale: 1
                            }]
                        }}
                    />
                    <Text numberOfLines={2} style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, flexShrink: 1, lineHeight: 20, color: colors.text[theme].primary }}>Halton Catholic Athletic Association</Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={20} style={{ marginRight: 4, flexGrow: 1 }} color={colors.text[theme].secondary} />
            </TouchableOpacity>

            
            <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 13, lineHeight: 18, paddingHorizontal: 16, marginTop: 16, color: colors.text[theme].primary }}>GP: <Text style={{ fontFamily: 'Figtree-Medium', color: colors.text[theme].secondary }}>&nbsp;Games played</Text></Text>
            <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 13, lineHeight: 18, paddingHorizontal: 16, marginVertical: 16, color: colors.text[theme].primary }}>PD: <Text style={{ fontFamily: 'Figtree-Medium', color: colors.text[theme].secondary }}>&nbsp;Point difference (points scored vs points against)</Text></Text>
            <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 13, lineHeight: 18, paddingHorizontal: 16, color: colors.text[theme].primary }}>PTS: <Text style={{ fontFamily: 'Figtree-Medium', color: colors.text[theme].secondary }}>&nbsp;Points (from wins, draws and losses)</Text></Text>

            <View style={{height: 200}} />
        </View>
    );
});

export default Standings;