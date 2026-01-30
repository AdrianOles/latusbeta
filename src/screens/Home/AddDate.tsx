import { View, Text, Pressable, Keyboard, TouchableOpacity, Linking, ActivityIndicator, Platform, Modal } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import colors from "../../colors";
import { useAuthContext } from "../../contexts/AuthContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import FilePhase from "../Resources/components/FilePhase";
import React, { useEffect, useState } from "react";
import LinkPhase from "../Resources/components/LinkPhase";
import { HomeStackParamList } from "../../navigation";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type AddDateRouteProp = RouteProp<HomeStackParamList, 'AddDate'>;

/**
 * Calculates the last day of June for the correct academic year.
 * The academic year is defined as starting in August.
 * @returns {Date} The last day of June.
 */
export const getMaxDateForAcademicYear = () => {
    const now = new Date();
    // Months are 0-indexed, so August is 7.
    const currentMonth = now.getMonth();
    let year = now.getFullYear();

    // If the current month is August (7) or later, the academic year
    // ends in the *next* calendar year.
    if (currentMonth >= 7) {
        year += 1;
    }

    // Month 5 is June (0-indexed)
    return new Date(year, 5, 30);
};


/**
 * Verifies if a given Date object represents the current day.
 * @param {Date} someDate The date object to check.
 * @returns {boolean} True if the date is today, false otherwise.
 */
const isToday = (someDate: Date): boolean => {
    const today = new Date();

    // Check if the input is a valid Date object to prevent errors
    if (!(someDate instanceof Date) || isNaN(someDate.getTime())) {
        return false;
    }

    return (
        someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
    );
};

export type DateType = {
    startDate: Date;
    endDate: Date;
}

const AddDate = () => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const route = useRoute<AddDateRouteProp>();
    const { dateChange, startDefault, endDefault } = route.params;
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState<Date>(startDefault);
    const [endDate, setEndDate] = useState<Date>(endDefault);
    const [openAndroidStart, setOpenAndroidStart] = useState(false);
    const [openAndroidEnd, setOpenAndroidEnd] = useState(false);

    /**
     * 
     * !Change start, confirm, the endDate doesn't adjust on the actual CREATE SCREEN
     */

    const handleAttach = async () => {
        setLoading(true);
        if (startDate && endDate) {
            const dateData: DateType = {
                startDate: startDate,
                endDate: endDate,
            };

            dateChange(dateData);

            // Navigate back to the previous screen
            navigation.goBack();
        }
        setLoading(false);
    };

    const endChange = (date: Date | undefined) => {
        if (date) {
            date.setHours(23, 59, 59, 999);
            setEndDate(date);
        }
    }

    const startChange = (date: Date | undefined) => {
        if (date) {
            setStartDate(date);
            if (!isToday(date)) {
                endChange(date)
            }
        }
    }

    const onStartChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // Android: Always close the picker state first
        if (Platform.OS === 'android') {
            setOpenAndroidStart(false);
        }

        if (event.type === 'set' && selectedDate) {
            startChange(selectedDate);
        }
    };

    const onEndChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setOpenAndroidEnd(false);
        }

        if (event.type === 'set' && selectedDate) {
            endChange(selectedDate);
        }
    };

    return (
        <View style={{ height: '100%', backgroundColor: colors.background[theme].elevated, paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
            <Pressable onPress={() => Keyboard.dismiss()} style={{
                height: 60, width: '100%', alignItems: 'center', justifyContent: 'center',
                paddingHorizontal: 16
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'center', marginLeft: 'auto', }}>
                    <Ionicons
                        name="close-outline" size={26}
                        color={colors.text[theme].primary}
                        style={{
                            backgroundColor: colors.fills[theme].standard,
                            borderRadius: 250, padding: 4
                        }}
                    />
                </TouchableOpacity>
            </Pressable>

            <Pressable onPress={() => Keyboard.dismiss()} style={{ alignItems: 'center', marginBottom: 32 }}>
                <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 22, lineHeight: 28, color: colors.text[theme].primary }}>Announcement Schedule</Text>
                <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>When does your announcement go live?</Text>
            </Pressable>

            <View style={{width: 280, alignSelf: 'center'}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexGrow: 1, marginTop: 16 }}>
                    <Text style={{
                        color: colors.text[theme].secondary, fontFamily: "Figtree-SemiBold", lineHeight: 20,
                        letterSpacing: 0.2, fontSize: 15, width: 60
                    }}>Starts</Text>
                    <View style={{
                        flexDirection: 'row', justifyContent: 'flex-start', flexGrow: 1,
                        marginLeft: 'auto', alignItems: 'center', 
                    }}>
                        {
                            Platform.OS === 'ios' ? (
                                <>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={startDate}
                                        mode={'date'}
                                        themeVariant={theme}
                                        is24Hour={true}
                                        display="default"
                                        onChange={(event, date) => startChange(date as Date)}
                                        minimumDate={new Date()}
                                        maximumDate={getMaxDateForAcademicYear()}
                                    />
                                    <Text style={{
                                        fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 13, marginLeft: 8,
                                        color: colors.text[theme].secondary
                                    }}>
                                        {isToday(startDate) ? 'Now' : 'at 12:00 AM'}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    {
                                        startDate && (
                                            <Text style={{
                                                fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 13, marginLeft: 8,
                                                color: colors.text[theme].secondary, marginRight: 'auto'
                                            }}>
                                                    {isToday(startDate) ? 'Now' : `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) } at 12:00 AM`}
                                            </Text>
                                        )
                                    }
                                    <TouchableOpacity onPress={() => setOpenAndroidStart(true)}>
                                        <Text style={{
                                            fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 13, marginLeft: 8,
                                            color: colors.text[theme].secondary
                                        }}>
                                            Change
                                        </Text>
                                    </TouchableOpacity>
                                        
                                    {/* ANDROID ONLY - No Modal Wrapper */}
                                    {openAndroidStart && (
                                        <DateTimePicker
                                            value={startDate}
                                            mode="date"
                                            display="default"
                                            onChange={onStartChange}
                                            minimumDate={new Date()}
                                            maximumDate={getMaxDateForAcademicYear()}
                                        />
                                    )}
                                </>
                                    
                            )
                        }
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexGrow: 1, marginTop: 16 }}>
                    <Text style={{
                        color: colors.text[theme].secondary, fontFamily: "Figtree-SemiBold", lineHeight: 20,
                        letterSpacing: 0.2, fontSize: 15, width: 60
                    }}>Ends</Text>
                    <View style={{
                        flexDirection: 'row', justifyContent: 'flex-start', flexGrow: 1, marginLeft: 'auto', alignItems: 'center',
                    }}>
                        {
                            Platform.OS === 'ios' ? (
                                <>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={endDate}
                                        themeVariant={theme}
                                        mode={'date'}
                                        is24Hour={true}
                                        display={"default"}
                                        onChange={(event, date) => endChange(date)}
                                        minimumDate={startDate}
                                        maximumDate={getMaxDateForAcademicYear()}
                                    />
                                    <Text style={{
                                        fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 13, marginLeft: 8,
                                        color: colors.text[theme].secondary
                                    }}>
                                        at 11:59 PM
                                    </Text>
                                </>
                            ) : (
                                <>
                                    {
                                        endDate && (
                                            <Text style={{
                                                fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 13, marginLeft: 8,
                                                color: colors.text[theme].secondary, marginRight: 'auto'
                                            }}>
                                                {`${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at 11:59 PM`}
                                            </Text>
                                        )
                                    }
                                    <TouchableOpacity onPress={() => setOpenAndroidEnd(true)}>
                                        <Text style={{
                                            fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 13, marginLeft: 8,
                                            color: colors.text[theme].secondary
                                        }}>
                                            Change
                                        </Text>
                                    </TouchableOpacity>

                                    {openAndroidEnd && (
                                        <DateTimePicker
                                            value={endDate}
                                            mode="date"
                                            display="default"
                                            onChange={onEndChange}
                                            minimumDate={startDate}
                                            maximumDate={getMaxDateForAcademicYear()}
                                        />
                                    )}
                                </>

                            )
                        }
                    </View>
                </View>
            </View>
            

            <Pressable onPress={() => Keyboard.dismiss()} style={{height: 'auto', width: '100%', flexGrow: 1}} />

            <Pressable onPress={() => Keyboard.dismiss()} style={{
                padding: 16, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.fills[theme].stroke,
                display: 'flex', flexDirection: 'row', marginTop: 'auto'
            }}>
                <TouchableOpacity disabled={loading} onPress={handleAttach} style={{
                    flexGrow: 1, padding: 24, borderRadius: 250, backgroundColor: colors.text[theme].primary,
                    opacity: loading ? 0.5 : 1
                }}>
                    {loading && (
                        <ActivityIndicator />
                    )}
                    {!loading && (
                        <Text style={{ color: colors.background[theme].general, textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
                            Confirm Schedule
                        </Text>
                    )}
                </TouchableOpacity>
            </Pressable>
        </View>
    )
}

export default AddDate;