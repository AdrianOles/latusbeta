import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext';
import colors from '../../colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'aws-amplify/auth'
import { get } from 'aws-amplify/api';
import { Ionicons } from '@expo/vector-icons';
import { ndLogo, stkLogo } from '../../../assets';
import { stfxLogo } from '../../../assets';
import { asLogo } from '../../../assets';
import { brLogo } from '../../../assets';
import { ccLogo } from '../../../assets';
import { ctkLogo } from '../../../assets';
import { htLogo } from '../../../assets';
import { loylogo } from '../../../assets';
import { staLogo } from '../../../assets';

type Game = {
    time: string;
    schools: string[];
    notes?: string;
    scores?: {
        visitor: number | null;
        home: number | null;
    };
};

type LeagueGames = {
    league: string;
    games: Game[];
};

const Sports = () => {
    const { authUser, theme } = useAuthContext();
    const [data, setData] = useState<LeagueGames[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchScores = async () => {
        try {
            const restOperation = get({
                apiName: 'sportsAPI',
                path: '/scores',
            });

            const { body } = await restOperation.response;

            const json = (await body.json()) as LeagueGames[];
            console.log("json: ")
            console.log(json);
            setData(json);

        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                (error as any).response?.body
            ) {
                try {
                    const body = await (error as any).response.body.text();
                    console.error('GET call failed:', JSON.parse(body));
                } catch (parseError) {
                    console.error('Error parsing error body:', parseError);
                }
            } else {
                console.error('GET call failed:', error);
            }
        }
    };

    useEffect(() => {
        if (!data) {
            setLoading(true);
            fetchScores();
            setLoading(false);
        }
    }, [data]);

    const schoolPhoto = (id: string) => {
        switch (id) {
            case "St. Ignatius of Loyola":
                return loylogo;
            case "St. Thomas Aquinas":
                return staLogo
            case "Holy Trinity":
                return htLogo
            case "Bishop Reding":
                return brLogo
            case "Notre Dame":
                return ndLogo
            case "St. Francis Xavier":
                return stfxLogo
            case "Assumption":
                return asLogo
            case "Corpus Christi":
                return ccLogo
            case "St. Kateri Tekakwitha":
                return stkLogo
            case "Christ the King":
                return ccLogo
            default:
                return loylogo
        }
    }

    return (
        <SafeAreaView style={{ backgroundColor: colors.background[theme].general }}>
            <ScrollView style={{ paddingHorizontal: 16 }}>
                {
                    data ? data?.map((item: LeagueGames, index: number) => (
                        <View key={index}>
                            <View style={{ paddingVertical: 16 }}>
                                <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 18 }}>{item.league}</Text>
                            </View>
                            <View>
                                {
                                    item?.games?.map((game: Game, index: number) => (
                                        <View key={index} style={{ paddingTop: 12, paddingHorizontal: 8, paddingBottom: 16, marginBottom: 12, borderRadius: 16, display: 'flex', gap: 8, borderWidth: 1, borderColor: colors.separator[theme].opaque }}>
                                            <View>
                                                <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Medium', fontSize: 11, lineHeight: 12 }}>Tues, Apr 22</Text>
                                            </View>
                                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                <View style={{ flex: 1, flexShrink: 1 }}>
                                                    <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, textAlign: 'right' }}>{game.schools[1]}</Text>
                                                </View>
                                                <View style={{ alignItems: 'center' }}>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Image
                                                            source={schoolPhoto(game.schools[1])}
                                                            style={{ width: 26, height: 26, marginHorizontal: 4 }}
                                                        />
                                                        <View
                                                            style={{
                                                                backgroundColor: colors.text[theme].quarternary,
                                                                borderRadius: 8,
                                                                padding: 8,
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontFamily: 'Figtree-SemiBold',
                                                                    fontSize: 17,
                                                                    lineHeight: 17,
                                                                }}
                                                            >
                                                                {game.scores?.home} - {game.scores?.visitor}
                                                            </Text>
                                                        </View>
                                                        <Image
                                                            source={schoolPhoto(game.schools[0])}
                                                            style={{ width: 26, height: 26, marginHorizontal: 4 }}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={{ flex: 1, flexShrink: 1 }}>
                                                    <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, textAlign: 'left' }}>{game.schools[0]}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                }
                            </View>
                        </View>
                    )) : (
                        <ActivityIndicator></ActivityIndicator>
                    )
                }
            </ScrollView>
        </SafeAreaView>
    )
}

export default Sports