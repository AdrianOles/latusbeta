// Outside of your Testrun component, ideally in its own file (e.g., GameCard.tsx)
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigation';
import { asLogo, stfxLogo } from '../../../../assets';
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

const getPhoto = (school: string) => {
    switch (school) {
        case "St. Thomas Aquinas":
            return "https://b1352154.smushcdn.com/1352154/wp-content/uploads/2023/09/hcdsb-secondary-logo_assumption.png?lossy=0&strip=1&webp=1"
        case "St. Ignatius of Loyola":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-Loyola_Loyola.png";
        case "Notre Dame":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-ND_NotreDame.png";
        case "Bishop Reding":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-BR_BishopReding.png";
        case "Holy Trinity":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-HT_HolyTrinity.png";
        case "Assumption":
            return "https://b1352154.smushcdn.com/1352154/wp-content/uploads/sites/5/2022/05/Logo-Assumption-Crusaders-Circle-Pantone-2965C-darker.png?lossy=0&strip=1&webp=1";
        case "Corpus Christi":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-Corpus_CorpusChristi.png";
        case "St. Francis Xavier":
            return "https://upload.wikimedia.org/wikipedia/commons/3/3b/St._Francis_Xavier_Milton_emblem.png";
        case "St. Kateri Tekakwitha":
            return "https://www.hcdsb.org/wp-content/uploads/2021/07/Logo_StKateri_web_small.png";
        default: 
            return "https://www.hcdsb.org/wp-content/uploads/2021/07/Logo_StKateri_web_small.png"
    }
}

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

function formatDateString(dateStr: string): string {
    const parts = dateStr.split(", "); // ["Wednesday", "September 18", "2024"]

    if (parts.length < 3) return "";

    const [month, day] = parts[1].split(" "); // ["September", "18"]

    // Create a mapping for month abbreviations
    const monthMap: Record<string, string> = {
        January: "Jan",
        February: "Feb",
        March: "Mar",
        April: "Apr",
        May: "May",
        June: "Jun",
        July: "Jul",
        August: "Aug",
        September: "Sept", // <-- with the "t"
        October: "Oct",
        November: "Nov",
        December: "Dec",
    };

    return `${monthMap[month]} ${day}`;
}

export const removeLeadingZero = (time: string) => {
    // 1. Convert the input result to a string and store it in the temp variable.
    //    The .toString() ensures we can check the first character.
    let tempVariable = time.split(" ")[0] + " " + time.split(" ")[1][0] + time.split(" ")[1][1];

    // 2. Check if the tempVariable is not empty AND if its first character is '0'.
    if (tempVariable.length > 0 && tempVariable[0] === '0') {
        // 3. Remove the first character (the leading '0').
        //    The .substring(1) method returns the part of the string 
        //    starting from index 1 (the second character) to the end.
        tempVariable = tempVariable.substring(1);
    }

    // 4. Return the modified result.
    return tempVariable;
}

const DefaultSchoolLogo = React.memo(() => (
    <View style={{ marginRight: 10 }}>
        <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
            <Path d="M24 1.99999V8.99998C24 15.59 20.81 19.5837 18.1338 21.7737C15.2513 24.1312 12.3838 24.9324 12.2588 24.9649C12.0869 25.0117 11.9056 25.0117 11.7338 24.9649C11.6088 24.9324 8.745 24.1312 5.85875 21.7737C3.19 19.5837 0 15.59 0 8.99998V1.99999C0 1.46956 0.210714 0.960856 0.585786 0.585785C0.960859 0.210713 1.46957 0 2 0H22C22.5304 0 23.0391 0.210713 23.4142 0.585785C23.7893 0.960856 24 1.46956 24 1.99999Z" fill="#9A999E" />
        </Svg>
    </View>
));

const GameCardComponent = React.memo(({ item, widthScreen, lpadding, date, time, remove, format, mode, dateString, league, teamName }:
    {
        item: gameType, widthScreen: number, lpadding?: number | undefined, date?: string, time?: string, remove?: boolean,
        format?: "W" | "L" | "D", mode?: string, dateString?: string, league?: string, teamName?: string
    }) => {
    const navigation = useNavigation<HomeStackParamList>(); // If GameCard needs navigation
    const { theme } = useAuthContext();

    //Dervied states
    const homeScore = item.home.score ?? 0;
    const awayScore = item.visitor.score ?? 0;
    const homeName = item.home.name;
    const visitorName = item.visitor.name;

    const templateHome = !schoolList.includes(homeName);
    const templateAway = !schoolList.includes(visitorName);

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

    // Flags
    const pendingFlag = time ? time.includes("pending") : false;
    const TBAFlag = time ? time.includes("TBA") : false;
    const dateBuffer = date ? 0 : 0;

    // Helper Styles
    const homeFont = homeScore > awayScore ? "Figtree-SemiBold" : "Figtree-Regular";
    const homeColor = homeScore > awayScore ? colors.text[theme].body : (homeScore < awayScore ? colors.text[theme].secondary : colors.text[theme].body);

    const awayFont = homeScore < awayScore ? "Figtree-SemiBold" : "Figtree-Regular";
    const awayColor = homeScore < awayScore ? colors.text[theme].primary : (homeScore > awayScore ? colors.text[theme].secondary : colors.text[theme].body);

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
                paddingHorizontal: lpadding || 20,
                justifyContent: 'space-between',
                paddingTop: date ? 16 : 24
            }}
        >
            {date && (
                <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, paddingBottom: 12 }}>
                    {date}
                </Text>
            )}
            {league && !date && mode === 'school' && (
                <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, paddingBottom: 12 }}>
                    {league}
                </Text>
            )}

            <View style={{ flexDirection: 'row', width: '100%' }}>
                {/* TEAMS COLUMN */}
                <View style={{ flex: 1, marginRight: 12 }}>
                    {/* HOME TEAM */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        {!time && homeScore !== awayScore && (
                            <View style={{ position: 'absolute', left: -16, top: homeScore > awayScore ? 4 + dateBuffer : 32 + dateBuffer }}>
                                <Svg width="10" height="15" viewBox="0 0 10 15" fill="none">
                                    <Path d="M7.5 5.46558C8.16667 5.85048 8.16667 6.81273 7.5 7.19763L-5.33111e-07 11.5278C-0.666668 11.9127 -1.5 11.4315 -1.5 10.6617L-1.5 2.00148C-1.5 1.23168 -0.666667 0.750551 -7.88487e-08 1.13545L7.5 5.46558Z" fill={colors.text[theme].primary} />
                                </Svg>
                            </View>
                        )}

                        {templateHome ? <DefaultSchoolLogo /> : (
                            <Image
                                source={schoolLogos[homeName as school]}
                                style={{ width: 24, height: 24, marginRight: 10, resizeMode: 'contain' }}
                            />
                        )}
                        <Text numberOfLines={1} style={{ fontFamily: homeFont, fontSize: 15, color: homeColor, flex: 1 }}>
                            {homeName}
                        </Text>
                    </View>

                    {/* AWAY TEAM */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        {templateAway ? <DefaultSchoolLogo /> : (
                            <Image
                                source={schoolLogos[visitorName as school]}
                                style={{ width: 24, height: 24, marginRight: 10, resizeMode: 'contain' }}
                            />
                        )}
                        <Text numberOfLines={1} style={{ fontFamily: awayFont, fontSize: 15, color: awayColor, flex: 1 }}>
                            {visitorName}
                        </Text>
                    </View>
                </View>

                {/* STATUS/SCORE COLUMN */}
                {time ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                        <View style={{ width: 1, height: 42, backgroundColor: colors.fills[theme].stroke, marginRight: 16 }} />
                        <View>
                            <Text style={{ textAlign: 'center', fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, color: colors.text[theme].tertiary }}>
                                {pendingFlag ? "Pending" : TBAFlag ? "TBA" : "Starts"}
                            </Text>
                            {!pendingFlag && !TBAFlag && (
                                <Text style={{ textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 20, color: colors.text[theme].secondary }}>
                                    {removeLeadingZero(time)}
                                </Text>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <View>
                            <Text style={{ textAlign: 'center', fontFamily: 'Figtree-ExtraBold', fontSize: 18, color: colors.text[theme].primary, opacity: homeScore > awayScore && homeScore !== awayScore ? 1 : 0.55, marginBottom: 2 }}>
                                {homeScore}
                            </Text>
                            <Text style={{ textAlign: 'center', fontFamily: 'Figtree-ExtraBold', fontSize: 18, color: colors.text[theme].primary, opacity: awayScore > homeScore || homeScore === awayScore ? 1 : 0.55 }}>
                                {awayScore}
                            </Text>
                        </View>
                        <View style={{ width: 1, height: 42, backgroundColor: colors.fills[theme].stroke, marginHorizontal: 16 }} />

                        {(mode === 'team' || mode === 'school') ? (
                            <View style={{
                                width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
                                backgroundColor: (wld === 'W') ? colors.system[theme].green : (wld === 'L') ? colors.system[theme].red : colors.fills[theme].standard,
                            }}>
                                <Text style={{ fontFamily: "Figtree-Bold", fontSize: 15, color: colors.system.white }}>
                                    {wld}
                                </Text>
                            </View>
                        ) : (
                            <Text style={{ textAlign: 'center', fontFamily: 'Figtree-Medium', fontSize: 14, color: colors.text[theme].tertiary }}>
                                Ended
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {!remove && (
                <View style={{ backgroundColor: colors.fills[theme].stroke, height: 1, width: '100%', marginTop: 20 }} />
            )}
        </TouchableOpacity>
    );
});

// Use React.memo for performance optimization
export const GameCard = React.memo(GameCardComponent);