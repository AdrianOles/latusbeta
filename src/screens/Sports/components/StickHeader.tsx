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
import { hcaa } from "../../../../assets";

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
             boxShadow: '0px 1px 8px rgba(56, 54, 64, 0.05)'
         }}>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0, paddingHorizontal: 16, paddingTop: 4
            }}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Image 
                        source={hcaa}
                        style={{ width: 104, height: 32 }}
                    />
                    <Text maxFontSizeMultiplier={1} style={{ fontSize: 24, fontFamily: 'Figtree-Bold', color: colors.text[theme].primary, marginLeft: 4 }}>
                        
                    </Text>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => {
                        setTempDate(selectedDate); // Ensure the temporary date starts at the current value
                        setShowPicker(true);
                    }} style={{ paddingHorizontal: 6, paddingVertical: 6, marginRight: 4 }}>
                        <Ionicons name="calendar-outline" size={26} color={colors.text[theme].primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("SportsSearch")} style={{ paddingHorizontal: 16, paddingVertical: 10, paddingRight: 8 }}>
                        <Ionicons name="search-outline" size={26} color={colors.text[theme].primary} />
                    </TouchableOpacity>
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