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
import { LinearGradient } from "expo-linear-gradient";
import { school } from "..";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

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
    return `${tempVariable}`;
}

const GameInfo = React.memo(({ location, league, home, away, sets, time, dateString, notes, pending, winner }: 
    { pending?: boolean, notes?: string, dateString?: string, location: string, league: string, home: string, 
        away: string, time?: string, sets: { home: number[] | undefined, visitor: number[] | undefined } | undefined,
        winner?: string
    }) => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();

    const handlePress = () => {
        Linking.openURL('https://hcaa.ca').catch(err => console.error("Couldn't load page", err));
    };

    const formattedDate = (() => {
        // Helper to format the date object
        const format = (dateObj: Date) => {
            const options: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            };

            let formatted = dateObj.toLocaleDateString('en-US', options);

            // No replace needed for long weekday format
            return formatted;
        };

        // 1. Handle null/undefined/empty string
        if (!dateString) return undefined;

        // Clean up any leading/trailing whitespace before testing
        const cleanDateString = dateString.trim();

        // 2. If it's the ISO format (YYYY-MM-DD), parse and format it correctly.
        if (/^(\d{4})-(\d{2})-(\d{2})$/.test(cleanDateString)) {
            try {
                const localDateString = cleanDateString + 'T12:00:00';
                const dateObj = new Date(localDateString);

                if (!isNaN(dateObj.getTime())) {
                    return format(dateObj);
                }
            } catch (e) {
                // Fallthrough
            }
        }

        // 3. If it's already in the desired format (e.g., "Tuesday, Jan 17"), return it.
        if (/^[A-Za-z]+,\s[A-Za-z]{3}\s\d{1,2}$/.test(cleanDateString)) {
            return cleanDateString; // Returning the cleaned string
        }

        // 4. Handle "MMM D" or "MMM  DD" format (e.g., "Dec 2" or "Dec  2")
        if (/^[A-Za-z]{3}\s+\d{1,2}$/.test(cleanDateString)) {
            try {
                // Normalize spaces just to be extra safe
                const normalizedDateString = cleanDateString.replace(/\s+/g, ' ');
                
                // Parse month and day manually for reliability
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const parts = normalizedDateString.split(' ');
                const monthStr = parts[0];
                const day = parseInt(parts[1], 10);
                const monthIndex = months.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
                
                if (monthIndex !== -1 && !isNaN(day)) {
                    const currentYear = new Date().getFullYear();
                    const dateObj = new Date(currentYear, monthIndex, day);
                    
                    if (!isNaN(dateObj.getTime())) {
                        return format(dateObj);
                    }
                }
            } catch (e) {
                // Fallthrough
            }
        }

        // 5. If it's the complex full format, use the helper.
        // Assuming convertFullDateToISO is defined in your outer scope
        const isoDate = convertFullDateToISO(cleanDateString);

        if (isoDate) {
            try {
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

    const getGameType = (league: string): string => {
        const regex = /(ghac|playoff final|quarter final|semi final|final)/i;

        const match = league.match(regex);

        if(match) {
            const lowerMatch = match[0].toLowerCase();
            if (match[0].toLowerCase() === "ghac") {
                return "GHAC";
            }
            return lowerMatch.charAt(0).toUpperCase() + lowerMatch.slice(1);
        }

        return "Regular season";
    }

    const extractFacility = (notes: string): string | null => {
        console.log(notes)
        const regex = /(?:court|rink|arena|diamond|field|sheet)\s*[#]?\s*\d+|D\d+/i;

        const match = notes.toLowerCase().match(regex);

        if (match) {
            const rawMatch = match[0];
            console.log(rawMatch.charAt(0).toUpperCase() + rawMatch.slice(1).toLowerCase())
            return rawMatch.charAt(0).toUpperCase() + rawMatch.slice(1).toLowerCase();
        }

        return null;
    }
    
    return (
        <ScrollView style={{
            display: 'flex', flexDirection: 'column', minWidth: SCREEN_WIDTH, maxWidth: SCREEN_WIDTH,
            paddingHorizontal: 8
        }}>
            {
                getGameType(notes ?? "") === "Playoff final" && winner && (
                    <View style={{
                        backgroundColor: colors.background[theme].elevated, display: 'flex', flexDirection: 'column', borderRadius: 16,
                        boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)", marginBottom: 8, padding: 16
                    }}>
                        <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Bold', fontSize: 17, color: colors.schools[winner as school][theme].primary, textAlign: 'center', lineHeight: 22 }}>
                            Congratulations {`${winner}`}!
                        </Text>
                        <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-Regular', fontSize: 13, color: colors.text[theme].tertiary, textAlign: 'center', lineHeight: 17 }}>
                            {league} Champions
                        </Text>
                    </View>
                )
            }
            {
                sets && sets.home && sets.visitor && (
                    <VolleyCard home={home} away={away} scores={{
                        home: sets.home,
                        away: sets.visitor,
                    }} />
                )
            }

            {
                pending && (
                    <View style={{
                        backgroundColor: colors.background[theme].elevated, display: 'flex', flexDirection: 'column', borderRadius: 16,
                        boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)", marginBottom: 8, padding: 16
                    }}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                            <Ionicons name="stopwatch-outline" size={22} color={colors.system[theme].yellow} style={{ }} />
                            <Text maxFontSizeMultiplier={1.2} style={{color: colors.system[theme].yellow, fontFamily: 'Figtree-SemiBold', fontSize: 15}}>
                                Pending score
                            </Text>
                        </View>
                        <Text maxFontSizeMultiplier={1.1} style={{fontFamily: 'Figtree-Regular', fontSize: 15, color: colors.text[theme].primary, marginBottom: 4}}>
                            This game's results are not posted yet.
                        </Text>
                        <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-Regular', fontSize: 11, color: colors.text[theme].tertiary }}>
                            If it's been 24 hours, double check for possible cancellations.
                        </Text>
                    </View>
                )
            }

            <View style={{
                backgroundColor: colors.background[theme].elevated, display: 'flex', flexDirection: 'column', borderRadius: 16,
                boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)", marginBottom: 8
            }}>
                <TouchableOpacity onPress={handlePressHome} style={{
                    display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between', position: 'relative',
                    paddingBottom: 0, paddingRight: 0
                }}>
                    <View>
                        <Ionicons name="trophy" size={22} color={colors.text[theme].primary} style={{paddingBottom: 12}} />
                    </View>
                    <View style={{
                        justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingRight: 16, 
                        borderBottomColor: colors.fills[theme].subtle, borderBottomWidth: 1, marginLeft: 12, flexGrow: 1
                    }}>
                        <View style={{
                            display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 16
                        }}>
                            <View style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignContent: 'center', justifyContent: 'center'
                            }}>
                                {/* <Ionicons name="football" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} /> */}
                                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Bold', fontSize: 15, color: colors.text[theme].primary }}>{league}</Text>
                                <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-Regular', fontSize: 15, color: colors.text[theme].secondary }}>
                                    {getGameType(notes ?? "")}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color={colors.text[theme].secondary} style={{ marginBottom: 14 }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}} style={{
                    display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between', position: 'relative',
                    paddingBottom: 0, paddingRight: 0, minHeight: 62
                }}>
                    <View>
                        <Ionicons name="location" size={22} color={colors.text[theme].primary} style={{ paddingBottom: 12 }} />
                    </View>
                    <View style={{
                        justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingRight: 16,
                        borderBottomColor: colors.fills[theme].subtle, borderBottomWidth: dateString ? 1 : 0, marginLeft: 12, flexGrow: 1
                    }}>
                        <View style={{
                            display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 16
                        }}>
                            <View style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignContent: 'center', justifyContent: 'center'
                            }}>
                                {/* <Ionicons name="football" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} /> */}
                                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: extractFacility(notes ?? "") ? 'Figtree-Bold' : 'Figtree-Regular', fontSize: 15, color: colors.text[theme].primary}}>{location}</Text>
                                {
                                    extractFacility(notes ?? "") && (
                                        <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-Regular', fontSize: 15, color: colors.text[theme].secondary }}>
                                            {extractFacility(notes ?? "")}
                                        </Text>
                                    )
                                }
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color={colors.text[theme].secondary} style={{ marginBottom: 14 }} />
                    </View>
                </TouchableOpacity>
                {dateString && (
                    <View style={{
                        display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between', position: 'relative',
                        paddingBottom: 0, height: 62
                    }}>
                        <View>
                            <Ionicons name="time" size={22} color={colors.text[theme].primary} style={{ paddingBottom: 14 }} />
                        </View>
                        <View style={{
                            display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 12, paddingRight: 16, flexGrow: 1,
                            paddingBottom: 16,
                        }}>
                            <View style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1, alignContent: 'center', justifyContent: 'center'
                            }}>
                                <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-Regular', fontSize: 15, color: colors.text[theme].primary }}>{formattedDate}{time ? ` at ${removeLeadingZero(time)}` : ""}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {
                getGameType(notes ?? "") === "GHAC" && (
                    <View style={{
                        backgroundColor: colors.background[theme].elevated, display: 'flex', flexDirection: 'row', borderRadius: 16,
                        boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)", marginBottom: 8, padding: 16, alignItems: 'center', paddingLeft: 12
                    }}>
                        <View>
                            <Image
                                source={require('../../../../assets/schools/ghac.png')}
                                style={{
                                    height: 28, aspectRatio: 1,  objectFit: 'contain'
                                }}
                            />
                        </View>
                        <View style={{marginLeft: 12}}>
                            <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, color: colors.text[theme].primary, textAlign: 'left' }}>
                                GHAC Event
                            </Text>
                            <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-Regular', fontSize: 15, color: colors.text[theme].secondary, textAlign: 'left' }}>
                                Teams across school boards in the Golden Horseshoe area face off.
                            </Text>
                        </View>
                    </View>
                )
            }

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
                    <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].primary }}>Halton Catholic Athletic Association</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.text[theme].primary} />
            </TouchableOpacity>
            <Text maxFontSizeMultiplier={1.1} style={{ fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 15, marginLeft: 16, marginBottom: 16, color: colors.text[theme].secondary }}>
                Data is provided by HCAA's site.
            </Text>
            <View style={{height: 400, width: 'auto'}} />
        </ScrollView>
    );
});

export default GameInfo;