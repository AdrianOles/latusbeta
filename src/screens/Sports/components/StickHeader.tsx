import React, { useState } from "react";
import { TouchableOpacity, View, Text, Image} from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { AuthUserType, useAuthContext } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../navigation";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { getMaxDateForAcademicYear } from "../../Home/AddDate";

interface StickHeaderProps {
    currentPage: SharedValue<number>;
    onTabPress: (index: number) => void;
    authUser: AuthUserType | null;
    dateSearch: string; // <-- Add this prop
    onDayPress: () => void;
}

const StickHeader = React.memo(({ currentPage, onTabPress, authUser, dateSearch, onDayPress }: StickHeaderProps) => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const [date, setDate] = useState<Date>(new Date());

    const handlePressForward = () => {
        // Only tell the parent to go to the next page
        onTabPress(currentPage.value + 1);
    }

    const handlePressBack = () => {
        // Only tell the parent to go to the previous page
        onTabPress(currentPage.value - 1);
    }

    return (
        <View style={{ display: 'flex', backgroundColor: colors.background[theme].elevated, flexShrink: 0, height: 105, marginTop: 'auto', opacity: 1 }}>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0,
                borderColor: colors.fills[theme].stroke, paddingHorizontal: 16, paddingTop: 4
            }}>
                <Text style={{ fontSize: 24, fontFamily: 'Figtree-Bold', color: colors.text[theme].primary }}>
                    HCAA
                    <Text style={{ fontFamily: 'Figtree-Regular' }}> Sports</Text>
                </Text>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => navigation.navigate("SportsSearch")} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                        <Ionicons name="search-outline" size={24} color={colors.text[theme].primary} />
                    </TouchableOpacity>

                    {
                        authUser && authUser.school != 'stfx' && (
                            <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 250, backgroundColor: '#a1234A71', width: 36, aspectRatio: 1 }}>
                                <Text style={{textAlign: 'center', fontFamily: 'Figtree-Bold'}}>AO</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
            <View style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
                borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: 1, flexDirection: 'row', flex: 1
            }}>
                <TouchableOpacity onPress={() => handlePressBack()} style={{
                    flexGrow: 1, paddingHorizontal: 16, borderRadius: 6, height: '100%',
                    backgroundColor: colors.fills[theme].standard, justifyContent: 'center', alignItems: 'center'
                }}>
                    <Ionicons name="chevron-back-outline" size={24} color={colors.text[theme].primary} />
                </TouchableOpacity>
                <View style={{justifyContent: 'center', alignItems: 'center', paddingRight: 12}}>
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={'date'}
                        themeVariant={theme}
                        is24Hour={true}
                        display="default"
                        onChange={(event, date) => setDate(date as Date)}
                        minimumDate={new Date()}
                        style={{ justifyContent: 'center', alignItems: 'center'}}
                        maximumDate={getMaxDateForAcademicYear()}
                    />
                </View>
                <TouchableOpacity onPress={() => handlePressForward()} style={{
                    flexGrow: 1, paddingHorizontal: 16, borderRadius: 6, height: '100%',
                    backgroundColor: colors.fills[theme].standard, justifyContent: 'center', alignItems: 'center'
                }}>
                    <Ionicons name="chevron-forward-outline" size={24} color={colors.text[theme].primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default StickHeader;