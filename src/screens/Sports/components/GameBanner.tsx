import React, { useEffect, useState } from "react";
import Animated from "react-native-reanimated";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, stfxLogo } from "../../../../assets";
import colors from "../../../colors";
import { HomeStackParamList } from "../../../navigation";
import { useNavigation } from "@react-navigation/native";
import { school } from "..";
import { schoolList } from "./GameCard";
import Svg, { Path } from "react-native-svg";
import { Image } from "expo-image";
import * as Notifications from 'expo-notifications';

// Tells iOS to show the banner even if the app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true, // Show the dropdown alert
        shouldShowList: true,   // Show in the notification center
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

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
    { animatedSchool, homeScore, awayScore, home, away, league, theme, pending, time, date, final }:
    { final: boolean, animatedSchool: any, pending: boolean | undefined, time: string, date?: string, homeScore: string, awayScore: string, home: string, away: string, league: string, theme: 'light' | 'dark' }
) => {
    const navigation = useNavigation<HomeStackParamList>();
    const [templateHome, setTemplateHome] = useState<boolean>(false);
    const [templateAway, setTemplateAway] = useState<boolean>(false);
    const testing = "12345";

    const correctFont = (testing).length > 2 ? ((testing).length > 4 ? 30 : 30) : 42;

    console.log("All data: ", { homeScore, awayScore, home, away, league, theme, pending, time, date, final });

    // useEffect(() => {
    //     async function getMyToken() {
    //         // 1. Ask for iOS permission
    //         const { status } = await Notifications.requestPermissionsAsync();
    //         if (status !== 'granted') {
    //             console.log('Permission not granted!');
    //             return;
    //         }

    //         // 2. Fetch the Expo token
    //         try {
    //             const tokenData = await Notifications.getExpoPushTokenAsync();
    //             console.log("\n👇 COPY THIS TOKEN 👇");
    //             console.log(tokenData.data);
    //             console.log("👆 COPY THIS TOKEN 👆\n");
    //         } catch (error) {
    //             console.error("Error fetching token:", error);
    //         }
    //     }

    //     getMyToken();
    // }, []);

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

    const formatGameDate = (date: string): string => {
        const today = new Date();
        const todayMonth = today.getMonth(); // 0-indexed (0 = Jan, 1 = Feb)
        const todayDay = today.getDate();
        const todayYear = today.getFullYear();

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let targetMonth: number;
        let targetDay: number;
        let targetYear: number | null = null;
        let formattedString = date;

        // Handle "YYYY-MM-DD" format
        if (date.includes('-')) {
            const [year, month, day] = date.split('-');
            targetYear = parseInt(year, 10);
            targetMonth = parseInt(month, 10) - 1; // Convert to 0-indexed
            targetDay = parseInt(day, 10);

            formattedString = `${months[targetMonth]} ${targetDay}`;
        }
        // Handle "Feb 27" format
        else {
            const [monthStr, dayStr] = date.split(' ');
            targetMonth = months.indexOf(monthStr);
            targetDay = parseInt(dayStr, 10);
            // We don't have a year in this format, so we leave targetYear as null
        }

        // Check if the date matches today
        // If a year was provided, ensure it matches today's year. Otherwise, just check month and day.
        const isSameYear = targetYear === null || targetYear === todayYear;

        if (isSameYear && targetMonth === todayMonth && targetDay === todayDay) {
            return "Today";
        }

        return formattedString;
    };

    const formattedDate = date ? formatGameDate(date) : undefined;

    return (
        <Animated.View
            style={[animatedSchool, {
                position: 'absolute', top: 120, left: 0, right: 0
            }]}
        >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 8 }}>
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
                                height: 60, aspectRatio: 1, marginBottom: 8
                            }}
                            contentFit="contain"
                            transition={300}
                        />
                    )}
                    <Text maxFontSizeMultiplier={1} style={{ fontFamily: 'Figtree-SemiBold', fontSize: 13, color: colors.text[final ? 'dark' : theme].primary, textAlign: 'center' }}>
                        {home}
                    </Text>
                </TouchableOpacity>

                {/* Center View */}
                <View style={{ display: 'flex', flexDirection: time ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 0, paddingTop: 4, flexShrink: 1, minWidth: 117 }}>
                    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
                            {
                                !pending && time && formattedDate ? (
                                    <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                        <Text maxFontSizeMultiplier={1} style={{ paddingHorizontal: 16, fontSize: 20, fontFamily: 'Figtree-SemiBold', color: colors.text[final ? 'dark' : theme].primary }}>
                                            {time}
                                        </Text>
                                        <Text maxFontSizeMultiplier={1} style={{ paddingHorizontal: 16, fontSize: 15, fontFamily: 'Figtree-Regular', color: colors.text[final ? 'dark' : theme].secondary }}>
                                            {formattedDate}
                                        </Text>
                                    </View>
                                ): (
                                    <>
                                        <Text maxFontSizeMultiplier={1} style={{ paddingHorizontal: 16, fontSize: correctFont, fontFamily: 'Figtree-ExtraBold', color: (awayScore > homeScore) || pending ? colors.text[final ? 'dark' : theme].secondary : colors.text[final ? 'dark' : theme].primary }}>
                                            {pending ? "-" : homeScore}
                                        </Text>
                                        <View style={{ width: 1, height: 32, backgroundColor: colors.fills['dark'].stroke, marginHorizontal: 14 }} />
                                            <Text maxFontSizeMultiplier={1} style={{ paddingHorizontal: 16, fontSize: correctFont, fontFamily: 'Figtree-ExtraBold', color: (homeScore > awayScore) || pending ? colors.text[final ? 'dark' : theme].secondary : colors.text[final ? 'dark' : theme].primary }}>
                                            {pending ? '-' : awayScore}
                                        </Text>
                                    </>
                                )
                            }
                        </View>
                        <View style={{ justifyContent: 'center', marginTop: 24, width: 'auto' }}>
                            {
                                pending ? (
                                    <Text maxFontSizeMultiplier={1}
                                        style={{
                                            textAlign: 'center', fontSize: 11, paddingVertical: 4,
                                            fontFamily: 'Figtree-Medium', width: 60,
                                            borderRadius: 250,
                                            backgroundColor: "#FFD90019",
                                            color: colors.system[final ? 'dark' : theme].yellow,
                                        }}>
                                        Pending
                                    </Text>  
                                ) : !time && (
                                    <Text maxFontSizeMultiplier={1} style={{ textAlign: 'center', fontSize: 11, color: colors.text[final ? 'dark' : theme].tertiary, fontFamily: 'Figtree-Medium' }}>
                                        Ended
                                    </Text>  
                                )
                            }
                        </View>
                    </View>
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
                                height: 60, aspectRatio: 1, marginBottom: 8
                            }}
                            contentFit="contain"
                            transition={300}
                        />
                    )}
                    <Text numberOfLines={3} maxFontSizeMultiplier={1} style={{ fontFamily: 'Figtree-SemiBold', fontSize: 13, color: colors.text[final ? 'dark' : theme].primary, textAlign: 'center' }}>
                        {away}
                    </Text>
                </TouchableOpacity>

            </View>
        </Animated.View>
    )
});

export default GameBanner