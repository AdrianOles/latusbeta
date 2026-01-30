import React, { useEffect, useState } from "react";
import Animated from "react-native-reanimated";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, stfxLogo } from "../../../../assets";
import colors from "../../../colors";
import { HomeStackParamList } from "../../../navigation";
import { useNavigation } from "@react-navigation/native";
import { school } from "..";
import { schoolList } from "./GameCard";
import Svg, { Path } from "react-native-svg";

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

const getLocation = (school: string) => {
    switch (school) {
        case "St. Thomas Aquinas":
            return "Oakville, ON"
        case "St. Ignatius of Loyola":
            return "Oavkille, ON";
        case "Notre Dame":
            return "Burlington, ON";
        case "Bishop Reding":
            return "Milton, ON";
        case "Holy Trinity":
            return "Oavkille, ON";
        case "Assumption":
            return "Burlington, ON";
        case "Corpus Christi":
            return "Burlington, ON";
        case "St. Francis Xavier":
            return "Milton, ON";
        case "St. Kateri Tekakwitha":
            return "Milton, ON";
        case "Christ the King":
            return "Halton Hills, ON";
        default:
            return ""
    }
}

const GameBanner = React.memo((
    { animatedSchool, homeScore, awayScore, home, away, league, theme, pending, time, date }:
    { animatedSchool: any, pending: boolean | undefined, time: string, date?: string, homeScore: string, awayScore: string, home: string, away: string, league: string, theme: 'light' | 'dark' }
) => {
    const navigation = useNavigation<HomeStackParamList>();
    const [templateHome, setTemplateHome] = useState<boolean>(false);
    const [templateAway, setTemplateAway] = useState<boolean>(false);
    const testing = "12345";

    const correctFont = (testing).length > 2 ? ((testing).length > 4 ? 36 : 36) : 42;

    useEffect(() => {
            if (!schoolList.includes(home)) {
                setTemplateHome(true);
            } else {
                setTemplateHome(false);
            }
            if (!schoolList.includes(away)) {
                setTemplateAway(true);
            } else {
                setTemplateAway(false);
            }
    }, []);
    
    const handlePressHome = () => {
        if (schoolList.includes(home)) {
            navigation.navigate("SportsTeam", {
                team: home, league: league, org: "HCAA",
            });
        } 
    }

    const handlePressAway = () => {
        if (schoolList.includes(away)) {
            navigation.navigate("SportsTeam", {
                team: away, league: league, org: "HCAA",
            });
        }
    }

    return (
        <Animated.View
            style={[animatedSchool, {
                position: 'absolute', top: 80, left: 0, right: 0
            }]}
        >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 16 }}>
                <TouchableOpacity onPress={handlePressHome} style={{ flex: 1, alignItems: 'center', minWidth: 50 }}>
                    {templateHome ? (
                        <View style={{marginBottom: 8}}>
                            <Svg width="64" height="65" viewBox="0 0 24 25" fill="none">
                                <Path d="M24 1.99999V8.99998C24 15.59 20.81 19.5837 18.1338 21.7737C15.2513 24.1312 12.3838 24.9324 12.2588 24.9649C12.0869 25.0117 11.9056 25.0117 11.7338 24.9649C11.6088 24.9324 8.745 24.1312 5.85875 21.7737C3.19 19.5837 0 15.59 0 8.99998V1.99999C0 1.46956 0.210714 0.960856 0.585786 0.585785C0.960859 0.210713 1.46957 0 2 0H22C22.5304 0 23.0391 0.210713 23.4142 0.585785C23.7893 0.960856 24 1.46956 24 1.99999Z" fill="#9A999E" />
                            </Svg>
                        </View>
                    ) : (  
                        <Image
                            source={schoolLogos[home as school]}
                            style={{
                                height: 64, aspectRatio: 1, marginBottom: 8, objectFit: 'contain'
                            }}
                        />
                    )}
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, color: colors.text[theme].primary, textAlign: 'center' }}>
                        {home}
                    </Text>
                    <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, textAlign: 'center' }}>
                        {getLocation(home)}
                    </Text>
                </TouchableOpacity>

                {/* Center View */}
                <View style={{ display: 'flex', flexDirection: time ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 0, paddingTop: 4, flexShrink: 1 }}>
                    {time ? (
                        <>
                            <Text style={{fontFamily: "Figtree-Bold", fontSize: 20, letterSpacing: -0.02, color: colors.text[theme].primary}}>
                                {pending ? 'Pending' : time}
                            </Text>
                            <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 15, color: colors.text[theme].secondary}}>
                                {pending ? "Check later" : date}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={{ fontSize: correctFont, fontFamily: 'Figtree-ExtraBold', color: awayScore > homeScore ? colors.text[theme].secondary : colors.text[theme].primary }}>
                                {pending ? "-" : homeScore}
                            </Text>
                            <View style={{ width: 1, height: 32, backgroundColor: colors.fills['dark'].stroke, marginHorizontal: 14 }} />
                            <Text style={{ fontSize: correctFont, fontFamily: 'Figtree-ExtraBold', color: homeScore > awayScore ? colors.text[theme].secondary : colors.text[theme].primary }}>
                                {pending ? '-' : awayScore}
                            </Text>
                        </>
                    )}
                </View>

                {/* Right Side View */}
                <TouchableOpacity onPress={handlePressAway} style={{ flex: 1, alignItems: 'center', minWidth: 50 }}>
                    {templateAway ? (
                        <View style={{ marginBottom: 8 }}>
                            <Svg width="64" height="65" viewBox="0 0 24 25" fill="none">
                                <Path d="M24 1.99999V8.99998C24 15.59 20.81 19.5837 18.1338 21.7737C15.2513 24.1312 12.3838 24.9324 12.2588 24.9649C12.0869 25.0117 11.9056 25.0117 11.7338 24.9649C11.6088 24.9324 8.745 24.1312 5.85875 21.7737C3.19 19.5837 0 15.59 0 8.99998V1.99999C0 1.46956 0.210714 0.960856 0.585786 0.585785C0.960859 0.210713 1.46957 0 2 0H22C22.5304 0 23.0391 0.210713 23.4142 0.585785C23.7893 0.960856 24 1.46956 24 1.99999Z" fill="#9A999E" />
                            </Svg>
                        </View>
                    ) : (
                        <Image
                            source={schoolLogos[away as school]}
                            style={{
                                height: 64, aspectRatio: 1, marginBottom: 8, objectFit: 'contain'
                            }}
                        />
                    )}
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, color: colors.text[theme].primary, textAlign: 'center' }}>
                        {away}
                    </Text>
                    <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, textAlign: 'center' }}>
                        {getLocation(away)}
                    </Text>
                </TouchableOpacity>

            </View>
        </Animated.View>
    )
});

export default GameBanner