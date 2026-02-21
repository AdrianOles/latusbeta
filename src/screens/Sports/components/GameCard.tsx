import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigation';
import colors from '../../../colors';
import { useAuthContext } from '../../../contexts/AuthContext';
import { school } from '..';
import Svg, { Path } from 'react-native-svg';

interface gameType {
    league?: string;
    location?: string;
    notes: string;
    home: {
        name: string;
        score: number | null;
    };
    visitor: {
        name: string;
        score: number | null;
    };
    sets?: {
        home: number[],
        visitor: number[]
    }
}

export const schoolList = [
    "St. Thomas Aquinas",
    "St. Ignatius of Loyola",
    "Notre Dame",
    "Bishop Reding",
    "Holy Trinity",
    "Assumption",
    "Corpus Christi",
    "St. Francis Xavier",
    "St. Kateri Tekakwitha",
    "Christ the King"
]

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

export const removeLeadingZero = (time: string) => {
    let tempVariable = time.split(" ")[0] + " " + time.split(" ")[1][0] + time.split(" ")[1][1];
    if (tempVariable.length > 0 && tempVariable[0] === '0') {
        tempVariable = tempVariable.substring(1);
    }
    return tempVariable;
}

// --- EXTRACTED STATIC COMPONENTS ---
const DefaultSchoolLogo = React.memo(() => (
    <View style={{ marginRight: 10 }}>
        <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
            <Path d="M24 1.99999V8.99998C24 15.59 20.81 19.5837 18.1338 21.7737C15.2513 24.1312 12.3838 24.9324 12.2588 24.9649C12.0869 25.0117 11.9056 25.0117 11.7338 24.9649C11.6088 24.9324 8.745 24.1312 5.85875 21.7737C3.19 19.5837 0 15.59 0 8.99998V1.99999C0 1.46956 0.210714 0.960856 0.585786 0.585785C0.960859 0.210713 1.46957 0 2 0H22C22.5304 0 23.0391 0.210713 23.4142 0.585785C23.7893 0.960856 24 1.46956 24 1.99999Z" fill="#9A999E" />
        </Svg>
    </View>
));

const WinningArrow = React.memo(({ color }: { color: string }) => (
    <Svg width="10" height="15" viewBox="0 0 10 15" fill="none">
        <Path d="M7.5 5.46558C8.16667 5.85048 8.16667 6.81273 7.5 7.19763L-5.33111e-07 11.5278C-0.666668 11.9127 -1.5 11.4315 -1.5 10.6617L-1.5 2.00148C-1.5 1.23168 -0.666667 0.750551 -7.88487e-08 1.13545L7.5 5.46558Z" fill={color} />
    </Svg>
));
// -----------------------------------

const GameCardComponent = React.memo(({ item, widthScreen, lpadding, date, time, remove, format, mode, dateString, league, teamName }:
    {
        item: gameType, widthScreen: number, lpadding?: number | undefined, date?: string, time?: string, remove?: boolean,
        format?: "W" | "L" | "D", mode?: string, dateString?: string, league?: string, teamName?: string
    }) => {
    const navigation = useNavigation<HomeStackParamList>();
    const { theme } = useAuthContext();

    const homeScore = item.home.score ?? 0;
    const awayScore = item.visitor.score ?? 0;
    const homeName = item.home.name;
    const visitorName = item.visitor.name;

    const wld = useMemo(() => {
        let myScore = 0;
        let opponentScore = 0;

        if (teamName === homeName) {
            myScore = homeScore;
            opponentScore = awayScore;
        } else if (teamName === visitorName) {
            myScore = awayScore;
            opponentScore = homeScore;
        } else {
            return "D";
        }

        if (myScore > opponentScore) return "W";
        if (myScore < opponentScore) return "L";
        return "D";
    }, [homeScore, awayScore, teamName, homeName, visitorName]);

    const pendingFlag = time ? time.includes("pending") : false;
    const TBAFlag = time ? time.includes("TBA") : false;
    const dateBuffer = date ? 0 : 0;

    const isDraw = homeScore === awayScore;
    const homeWins = homeScore > awayScore;
    const awayWins = awayScore > homeScore;

    const homeFont = homeWins ? "Figtree-SemiBold" : "Figtree-Regular";
    const homeColor = isDraw
        ? colors.text[theme].body
        : (homeWins ? colors.text[theme].primary : colors.text[theme].secondary);

    const awayFont = awayWins ? "Figtree-SemiBold" : "Figtree-Regular";
    const awayColor = isDraw
        ? colors.text[theme].body
        : (awayWins ? colors.text[theme].primary : colors.text[theme].secondary);

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate("SportsGame", {
                homeTeam: homeName,
                awayTeam: visitorName,
                homeScore: homeScore,
                awayScore: awayScore,
                league: item.league,
                notes: item.notes,
                dateString: dateString || date,
                time: time,
                sets: item.sets,
                location: item.location
            })}
            style={{
                width: widthScreen,
                paddingBottom: remove ? 20 : 0,
                justifyContent: 'space-between',
                paddingTop: date ? 16 : 24
            }}
        >
            {date && (
                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-SemiBold', paddingHorizontal: 16, fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, paddingBottom: 12 }}>
                    {date}{item.notes && !item.notes.startsWith('Regular Season')
                        ? ` • ${item.notes.replace(/\.$/, '')}`
                        : ''}
                </Text>
            )}
            {league && !date && mode === 'school' && (
                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-SemiBold', paddingHorizontal: 16, fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, paddingBottom: 12 }}>
                    {league}
                </Text>
            )}

            <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: 16 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    {/* HOME TEAM */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        {!time && homeScore !== awayScore && (
                            <View style={{ position: 'absolute', left: -16, top: homeScore > awayScore ? 6 + dateBuffer : 36 + dateBuffer }}>
                                <WinningArrow color={colors.text[theme].primary} />
                            </View>
                        )}

                        <Image
                            source={schoolLogos[homeName as school]}
                            style={{ width: 24, height: 24, marginRight: 10 }}
                            contentFit="contain"
                            transition={300}
                        />
                        <Text maxFontSizeMultiplier={1.3} numberOfLines={1} style={{ fontFamily: homeFont, fontSize: 15, color: homeColor, flex: 1 }}>
                            {homeName}
                        </Text>
                    </View>

                    {/* AWAY TEAM */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Image
                            source={schoolLogos[visitorName as school]}
                            style={{ width: 24, height: 24, marginRight: 10 }}
                            contentFit="contain"
                            transition={300}
                        />
                        <Text maxFontSizeMultiplier={1.3} numberOfLines={1} style={{ fontFamily: awayFont, fontSize: 15, color: awayColor, flex: 1 }}>
                            {visitorName}
                        </Text>
                    </View>
                </View>
                
                {
                    !time && ((homeScore !== awayScore) || wld === 'D') && (
                        <View style={{ marginRight: 16, justifyContent: 'center', alignItems: 'center' }}>
                            <Text maxFontSizeMultiplier={1.2} style={{ textAlign: 'center', fontFamily: 'Figtree-Bold', fontSize: 17, color: homeColor, marginBottom: 4 }}>
                                {homeScore}
                            </Text>
                            <Text maxFontSizeMultiplier={1.2} style={{ textAlign: 'center', fontFamily: 'Figtree-Bold', fontSize: 17, color: awayColor, }}>
                                {awayScore}
                            </Text>
                        </View>
                    )
                }

                {time ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: 100 }}>
                        <View style={{ width: 1, height: 42, backgroundColor: colors.fills[theme].stroke }} />
                        <Text maxFontSizeMultiplier={1.13} style={{ textAlign: 'center', fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, color: colors.text[theme].tertiary, flexGrow: 1 }}>
                            {pendingFlag ? "Pending" : TBAFlag && "TBA"}
                        </Text>
                        {!pendingFlag && !TBAFlag && (
                            <Text maxFontSizeMultiplier={1.13} style={{ textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 20, color: colors.text[theme].secondary, flexGrow: 1 }}>
                                {removeLeadingZero(time)}
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: 100 }}>
                        <View style={{ width: 1, height: 42, backgroundColor: colors.fills[theme].stroke }} />
                        {(mode === 'team' || mode === 'school') ? (
                            <View style={{
                                width: 28, height: 28, justifyContent: 'center', alignItems: 'center', marginHorizontal: 'auto', borderRadius: 6,
                                backgroundColor: (wld === 'W') ? colors.system[theme].green : (wld === 'L') ? colors.system[theme].red : colors.fills[theme].standard,
                            }}>
                                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: "Figtree-Bold", fontSize: 15, color:  (wld === 'D') ? colors.text[theme].secondary : colors.system.white }}>
                                    {wld}
                                </Text>
                            </View>
                        ) : (
                            <Text maxFontSizeMultiplier={1.2} style={{ textAlign: 'center', fontFamily: 'Figtree-Medium', fontSize: 14, color: colors.text[theme].tertiary, flexGrow: 1 }}>
                                Ended
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {!remove && (
                <View style={{ backgroundColor: colors.fills[theme].subtle, height: 1, width: '100%', marginTop: 20 }} />
            )}
        </TouchableOpacity>
    );
});

export const GameCard = React.memo(GameCardComponent);