import React from "react";
import { TouchableOpacity, View, Text, Dimensions, ScrollView, Linking, Image } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { useAuthContext } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import Tab from "./Tab";
import { Ionicons } from '@expo/vector-icons';
import VolleyCard from "./VolleyCard";
import { convertFullDateToISO } from "../Team";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../navigation";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const removeLeadingZero = (time: string) => {
    // 1. Convert the input result to a string and store it in the temp variable.
    //    The .toString() ensures we can check the first character.
    let tempVariable = time.replace(/(AM|PM).*$/, '$1');

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

const GameInfo = React.memo(({ location, league, home, away, sets, time, dateString }: { dateString?: string, location: string, league: string, home: string, away: string, time?: string, sets: { home: number[] | undefined, visitor: number[] | undefined } | undefined }) => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    

    const handlePress = () => {
        Linking.openURL('https://hcaa.ca').catch(err => console.error("Couldn't load page", err));
    };

    const formattedDate = (() => {
        // Helper to format the date object
        const format = (dateObj: Date) => {
            return dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        };

        // 1. Handle null/undefined/empty string
        if (!dateString) return undefined;

        // 2. If it's the ISO format (YYYY-MM-DD), parse and format it correctly.
        if (/^(\d{4})-(\d{2})-(\d{2})$/.test(dateString)) {
            try {
                // FIX: DO NOT use 'new Date(dateString)'. 
                // Instead, use new Date(year, monthIndex, day) to interpret the date 
                // in the local time zone, or append a time component.

                // OPTION A (Best): Append a time component (T12:00:00) so it's interpreted
                // as noon, which is safe from time zone shifts.
                const localDateString = dateString + 'T12:00:00';
                const dateObj = new Date(localDateString);

                if (!isNaN(dateObj.getTime())) {
                    return format(dateObj);
                }
            } catch (e) {
                // Fallthrough to complex parsing if the date object creation fails
            }
        }

        // --- Steps 3 and 4 remain largely the same ---

        // 3. If it's already in the desired short format (e.g., "Nov 24"), return it.
        if (/^[A-Za-z]{3}\s\d{1,2}$/.test(dateString)) {
            return dateString;
        }

        // 4. If it's the complex full format ("Monday, February 9, 2026"), use the helper.
        const isoDate = convertFullDateToISO(dateString);

        if (isoDate) {
            try {
                // The isoDate returned by convertFullDateToISO is assumed to be YYYY-MM-DD.
                // Apply the same fix as in Step 2: append T12:00:00.
                const localDateString = isoDate + 'T12:00:00';
                const dateObj = new Date(localDateString);

                if (!isNaN(dateObj.getTime())) {
                    return format(dateObj);
                }
            } catch (e) {
                // Fallthrough
            }
        }

        return undefined;
    })();

    const expandLeagueAbbreviations = (league: string | undefined): string | undefined => {
        // If the input is undefined or null, return it as is.
        if (!league) {
            return league;
        }

        // Replace "Jr." with "Junior".
        // The 'g' flag ensures all occurrences are replaced.
        let result = league.replace(/Jr\./g, 'Junior');

        // Replace "Sr." with "Senior".
        // The 'g' flag ensures all occurrences are replaced.
        result = result.replace(/Sr\./g, 'Senior');

        return result;
    };

    const handlePressHome = () => {
        navigation.navigate("SportsLeague", { league: expandLeagueAbbreviations(league), org: "HCAA" })
    }
    
    return (
        <ScrollView style={{
            display: 'flex', flexDirection: 'column', minWidth: SCREEN_WIDTH, maxWidth: SCREEN_WIDTH,
            paddingHorizontal: 8
        }}>
            {
                sets && sets.home && sets.visitor && (
                    <VolleyCard home={home} away={away} scores={{
                        home: sets.home,
                        away: sets.visitor,
                    }} />
                )
            }

            <View style={{
                backgroundColor: colors.background[theme].elevated, display: 'flex', flexDirection: 'column', borderRadius: 16,
                marginBottom: 16, boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)", 
            }}>
                <TouchableOpacity onPress={handlePressHome} style={{
                    display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between',
                    borderBottomColor: colors.fills[theme].subtle, borderBottomWidth: 1
                }}>
                    <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>
                        League
                    </Text>
                    <View style={{
                        borderRadius: 250, paddingHorizontal: 8, paddingVertical: 4, display: 'flex', flexDirection: 'row',
                        alignItems: 'center', backgroundColor: colors.fills[theme].standard
                    }}>
                        {/* <Ionicons name="football" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} /> */}
                        <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>{league}</Text>
                    </View>
                </TouchableOpacity>
                <View style={{
                    display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center',justifyContent: 'space-between',
                    borderBottomColor: colors.fills[theme].subtle, borderBottomWidth: time ? 1 : 0
                }}>
                    <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>
                        Location
                    </Text>
                    <View style={{
                        borderRadius: 250, paddingHorizontal: 8, paddingVertical: 4, display: 'flex', flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        {/* <Ionicons name="location" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} /> */}
                        <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>{location}</Text>
                    </View>
                </View>
                {
                    time && (
                        <View style={{
                    display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between',
                    borderBottomColor: colors.fills[theme].subtle, borderBottomWidth: 0
                }}>
                    <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>
                        Time
                    </Text>
                    <View style={{
                        borderRadius: 250, paddingHorizontal: 8, paddingVertical: 4, display: 'flex', flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        {/* <Ionicons name="time" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} /> */}
                                <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>{formattedDate}, {removeLeadingZero(time)}</Text>
                    </View>
                </View>
                    )
                }
            </View>

            <TouchableOpacity onPress={handlePress} style={{
                display: 'flex', flexDirection: 'row', borderWidth: 0, padding: 16, paddingVertical: 20, alignItems: 'center', marginBottom: 12,
                borderColor: colors.fills[theme].subtle, borderRadius: 16, justifyContent: 'space-between', boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)",
                backgroundColor: colors.background[theme].elevated
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Image
                        source={require('../../../../assets/schools/hcaa.png')}
                        style={{
                            width: 28, aspectRatio: 1, marginRight: 8, objectFit: 'contain', transform: [{
                                scale: 1
                            }]
                        }}
                    />
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].primary }}>Halton Catholic Athletic Association</Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 15, marginLeft: 16, marginBottom: 16, color: colors.text[theme].secondary }}>
                Visit the HCAA home page for complete game details
            </Text>
            <View style={{height: 400, width: 'auto'}} />
        </ScrollView>
    );
});

export default GameInfo;