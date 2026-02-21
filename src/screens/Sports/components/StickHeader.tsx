import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Image, Platform, Modal, Button, Pressable} from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { AuthUserType, useAuthContext } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../navigation";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { getMaxDateForAcademicYear } from "../../Home/AddDate";
import DateScroll from "./DateScroll";
import { format } from 'date-fns';
import Svg, { Path } from "react-native-svg";

interface StickHeaderProps {
    currentPage: SharedValue<number>;
    onTabPress: (index: number) => void;
    authUser: AuthUserType | null;
    dateSearch: Date; // <-- Add this prop
    onDayPress: (date: Date, manualFlag?: boolean) => void;
    manualDate?: Date;
}

interface DatePickerProps {
    colors: {
        text: {
            [key: string]: { primary: string };
        };
    };
    theme: string;
}

const today = new Date();
const currentMonth = today.getMonth()
let startYear: number;
let endYear: number;

if (currentMonth >= 8) {
    startYear = today.getFullYear();
    endYear = today.getFullYear() + 1;
} else {
    startYear = today.getFullYear() - 1;
    endYear = today.getFullYear();
}

const minDateLimit = new Date(startYear, 8, 1);
const maxDateLimit = new Date(endYear, 6, 1);

const StickHeader = React.memo(({ currentPage, onTabPress, authUser, dateSearch, onDayPress, manualDate }: StickHeaderProps) => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [tempDate, setTempDate] = useState<Date>(manualDate ? manualDate : new Date());

    // Function to toggle the picker visibility
    const togglePicker = () => {
        setShowPicker((prev) => !prev);
    };

    const confirmSelection = () => {
        // This logic only runs if the 'Confirm' button is pressed.
        // This typically happens on iOS when using 'spinner' display mode 
        // inside a custom modal.
        if (Platform.OS === 'ios') {
            setSelectedDate(tempDate); // Finalize the selection from the temp state
            onDayPress(tempDate, true); // Use tempDate, as it holds the new value
            setShowPicker(false);      // Close the Modal
        }
        // Note: If you used 'default' display on iOS, the picker closes itself
        // and handleDateChange would handle the final selection, just like Android.
    };

    const cancelSelection = () => {
        setTempDate(selectedDate); // Reset temp date to the last confirmed date
        setShowPicker(false);      // Close the React Native Modal
        // setTempDate(new Date())

    };

    const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
        const { type } = event;

        if (Platform.OS === 'android') {
            // On Android, the picker is a system dialog that closes itself.
            // We must hide our state tracker immediately.
            setShowPicker(false);

            if (type === 'set' && date) {
                // User pressed "OK"
                setTempDate(date);
                setSelectedDate(date);
                onDayPress(date, true); // Update parent/scroll view immediately
            } else {
                // User pressed "Cancel" or dismissed the dialog
                setTempDate(selectedDate); // Revert temp to last confirmed date
            }
        }

        else if (Platform.OS === 'ios') {
            // On iOS, the spinner stays open inside our custom Modal.
            // We only update the tempDate so the user sees the spinner move.
            if (type === 'set' && date) {
                setTempDate(date);
            }
            // Note: We do NOT call onDayPress here for iOS because 
            // we wait for the "Confirm" button press.
        }
    };

    return (
        <View style={{
            display: 'flex', backgroundColor: colors.background[theme].elevated, flexShrink: 0, height: 100, marginTop: 'auto', opacity: 1,
            borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: authUser ? 1 : 0
         }}>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0,
                borderColor: colors.fills[theme].stroke, paddingHorizontal: 16, paddingTop: 4
            }}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Svg height={28} width={28} style={{top: 4}}>
                        <Path d="M0.560019 5.17465C1.30652 4.40238 2.51422 4.40277 3.26021 5.17553L12.0336 14.2634C12.6233 14.8737 13.5807 14.874 14.1733 14.264L16.9984 11.3411C17.0867 11.2501 17.2306 11.25 17.3188 11.3412L19.6998 13.8088C19.788 13.9002 19.7879 14.0486 19.6997 14.1399L19.6948 14.1379L15.2333 18.7527C14.0556 19.9711 12.1452 19.9704 10.9658 18.7513L0.559108 7.96957C-0.186821 7.19688 -0.186273 5.94694 0.560019 5.17465ZM10.9716 0.913396C12.1493 -0.305025 14.0606 -0.304402 15.2401 0.914787L25.6614 11.7092C26.4074 12.482 26.407 13.7328 25.6605 14.5051C24.914 15.2771 23.7062 15.2768 22.9603 14.5042L14.1752 5.40565C13.5854 4.79476 12.6272 4.79446 12.0346 5.40495L9.23283 8.30345C9.13195 8.40782 8.96743 8.40776 8.86662 8.30334L6.53049 5.88363C6.42969 5.77921 6.42975 5.60908 6.53061 5.50472L10.9716 0.913396Z"
                            fill={colors.text[theme].primary} fill-opacity="0.89"
                        />
                    </Svg>
                    <Text maxFontSizeMultiplier={1} style={{ fontSize: 24, fontFamily: 'Figtree-Bold', color: colors.text[theme].primary, marginLeft: 4 }}>
                        Sports
                    </Text>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => {
                        setTempDate(selectedDate); // Ensure the temporary date starts at the current value
                        setShowPicker(true);
                    }} style={{ paddingHorizontal: 6, paddingVertical: 10 }}>
                        <Ionicons name="calendar-outline" size={24} color={colors.text[theme].primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("SportsSearch")} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                        <Ionicons name="search-outline" size={24} color={colors.text[theme].primary} />
                    </TouchableOpacity>

                    {
                        authUser && authUser.school != 'STFX' && (
                            <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 250, backgroundColor: '#a1234A71', width: 36, aspectRatio: 1 }}>
                                <Text style={{textAlign: 'center', fontFamily: 'Figtree-Bold'}}>AO</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
            <DateScroll theme={theme} manualDate={manualDate} datePresent={dateSearch} onDateSelect={(date: Date, flag?: boolean) => onDayPress(date, flag)} />
            
            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={minDateLimit}
                    maximumDate={maxDateLimit}
                />
            )}        

            {Platform.OS === 'ios' && (
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={showPicker}
                    onRequestClose={cancelSelection}
                >
                    <Pressable onPress={cancelSelection} style={{
                        flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000060'
                    }}>
                        <Pressable style={{
                            backgroundColor: colors.background[theme].elevated, flexDirection: 'column', alignItems: 'center',
                            borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20, width: '100%'
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexGrow: 1, width: '100%'}}>
                                <TouchableOpacity onPress={cancelSelection} style={{ padding: 24 }}>
                                    <Text maxFontSizeMultiplier={1.5} style={{ color: colors.text[theme].secondary }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmSelection} style={{ padding: 24 }}>
                                    <Text maxFontSizeMultiplier={1.5} style={{ color: colors.system[theme].blue }}>Confirm</Text>
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                minimumDate={minDateLimit}
                                maximumDate={maxDateLimit}
                            />
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
});

export default StickHeader;