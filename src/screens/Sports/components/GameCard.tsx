// Outside of your Testrun component, ideally in its own file (e.g., GameCard.tsx)
import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigation';
import { asLogo, stfxLogo } from '../../../../assets';
import colors from '../../../colors';
import { useAuthContext } from '../../../contexts/AuthContext';
import { school } from '..';

interface gameType {
    league: string | undefined | null;
    location: string;
    notes: string;
    home: {
        name: string;
        score: number;
    };
    visitor: {
        name: string;
        score: number;
    }
}

const schoolList = [
    "St. Thomas Aquinas",
    "St. Ignatius of Loyola",
    "Notre Dame",
    "Bishop Reding",
    "Holy Trinity",
    "Assumption",
    "Corpus Christi",
    "St. Francis Xavier",
    "St. Kateri Tekakwitha"
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

const GameCardComponent = React.memo(({ item, widthScreen, lpadding, date, time, remove, format, mode }:
    {
        item: gameType, widthScreen: number, lpadding?: number | undefined, date?: string, time?: string, remove?: boolean,
        format?: "W" | "L" | "D", mode?: string
    }) => {
    const navigation = useNavigation<HomeStackParamList>(); // If GameCard needs navigation
    const { theme } = useAuthContext();

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate("SportsGame", {
                homeTeam: item.home.name,
                awayTeam: item.visitor.name,
                homeScore: item.home.score ? item.home.score : 0,
                awayScore: item.visitor.score ? item.visitor.score : 0,
                league: item.league,
                notes: item.notes
            })}
            style={{
                borderColor: colors.fills[theme].stroke, borderBottomWidth: remove ? 0 : 1, width: widthScreen, position: 'relative',
                display: 'flex', padding: 24, paddingHorizontal: lpadding ? lpadding : 24, justifyContent: 'space-between', paddingTop: date ? 16 : 24
            }}>
            {
                date && (
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, paddingBottom: 12 }}>
                        {date}
                    </Text>
                )
            }
            <View style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                <View style={{ display: 'flex', flexGrow: 1 }}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={schoolLogos[item.home.name as school]}
                            style={{
                                width: 28, aspectRatio: 1, marginRight: 8, objectFit: 'contain', transform: [{
                                    scale: 1
                                }]
                            }}
                        />
                        <Text style={{ fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20, color: (item.home.score > item.visitor.score) ? colors.text[theme].primary : colors.text[theme].secondary }}>{item.home.name}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: 4 }}>
                        <Image
                            source={schoolLogos[item.visitor.name as school]}
                            style={{
                                width: 28, aspectRatio: 1, marginRight: 8, objectFit: 'contain', transform: [{
                                    scale: 1
                                }]
                            }}
                        />
                        <Text style={{ fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20, color: (item.home.score < item.visitor.score) ? colors.text[theme].primary : colors.text[theme].secondary }}>{item.visitor.name}</Text>
                    </View>
                </View>
                {!time && (format || mode === 'league' || mode === 'game') && (
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        {
                            !item && (
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginRight: 12 }}>
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ position: 'relative' }}>
                                            <Text style={{ opacity: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 26 }}>
                                                00
                                            </Text>
                                            <Text style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, textAlign: 'right', lineHeight: 26, color: colors.text[theme].secondary }}>
                                                {/* {item.homeSets[0]} */}
                                            </Text>
                                        </View>
                                        <View style={{ position: 'relative', marginHorizontal: 8 }}>
                                            <Text style={{ opacity: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 26 }}>
                                                00
                                            </Text>
                                            <Text style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, textAlign: 'center', lineHeight: 26, color: colors.text[theme].secondary }}>
                                                {/* {item.homeSets[1]} */}
                                            </Text>
                                        </View>
                                        <View style={{ position: 'relative' }}>
                                            <Text style={{ opacity: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 26 }}>
                                                00
                                            </Text>
                                            <Text style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, textAlign: 'center', lineHeight: 26, color: colors.text[theme].secondary }}>
                                                {/* {item.homeSets[2]} */}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ backgroundColor: colors.fills[theme].stroke, height: 1, width: '100%' }} />
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ position: 'relative' }}>
                                            <Text style={{ opacity: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 26 }}>
                                                00
                                            </Text>
                                            <Text style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, textAlign: 'right', lineHeight: 26, color: colors.text[theme].secondary }}>
                                                {/* {item.awaySets[0]} */}
                                            </Text>
                                        </View>
                                        <View style={{ position: 'relative', marginHorizontal: 8 }}>
                                            <Text style={{ opacity: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 26 }}>
                                                00
                                            </Text>
                                            <Text style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, textAlign: 'center', lineHeight: 26, color: colors.text[theme].secondary }}>
                                                {/* {item.awaySets[1]} */}
                                            </Text>
                                        </View>
                                        <View style={{ position: 'relative', flexGrow: 1 }}>
                                            <Text style={{ opacity: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 26 }}>
                                                00
                                            </Text>
                                            <Text style={{ position: 'absolute', top: 0, left: 0, fontFamily: 'Figtree-SemiBold', fontSize: 13, textAlign: 'center', lineHeight: 26, color: colors.text[theme].secondary }}>
                                                {/* {item.awaySets[2]} */}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        }
                        <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontFamily: "Figtree-ExtraBold", fontSize: 22, textAlign: 'center', color: (item.home.score > item.visitor.score) ? colors.text[theme].primary : colors.text[theme].secondary }}>
                                    {item.home.score ? item.home.score : 0}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: colors.fills[theme].stroke, height: 1, width: '100%' }} />
                            <View style={{}}>
                                <Text style={{ fontFamily: 'Figtree-ExtraBold', fontSize: 22, textAlign: 'right', color: (item.home.score < item.visitor.score) ? colors.text[theme].primary : colors.text[theme].secondary }}>
                                    {item.visitor.score ? item.visitor.score : 0}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                <View style={{ 
                    marginLeft: 20, display: format ? 'flex': 'none', justifyContent: 'center',
                    alignItems: 'center', marginVertical: 'auto', width: 28, aspectRatio: 1,
                    backgroundColor: format === 'W' ? colors.system[theme].green : format === 'L' ? colors.system[theme].red : colors.system.grey 
                }}>
                    <Text style={{ fontFamily: "Figtree-Bold", fontSize: 15, color: colors.system.white }}>
                        {format}
                    </Text>
                </View>
                {time && (
                    <View style={{ marginVertical: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 8}}>
                        <View style={{width: 1, height: 30, backgroundColor: colors.fills[theme].stroke, marginRight: 16}} />
                        <View>
                            <Text style={{textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 20, color: colors.text[theme].primary}}>{time.split(" ")[0]}</Text>
                            <Text style={{ textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 13, lineHeight: 15, color: colors.text[theme].primary }}>{time.split(" ")[1]}</Text>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

// Use React.memo for performance optimization
export const GameCard = React.memo(GameCardComponent);