import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions,
    StyleSheet,
    ListRenderItemInfo
} from 'react-native';
import colors from '../../../colors';
// import colors from '../../../colors'; // Assuming this provides the structure for colors below

// --- Type Definitions ---
// Define a type for the date item data
type DateItem = Date;

const SCREEN_WIDTH = Dimensions.get('window').width;
const DATE_ITEM_WIDTH = 114; // Fixed width for each date item
// ----------------------------------------

// Define the interface for the component's props
interface DatePickerProps {
    /** * Function called when a new date is selected.
     * Passes the selected Date object back to the parent.
     */
    onDateSelect: (date: Date, flag?: boolean) => void;
    datePresent: Date;
    theme: 'light' | 'dark';
    manualDate?: Date;
}

// Helper to check if two Date objects represent the same day (ignoring time)
const isSameDay = (d1: DateItem, d2: DateItem): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const DateScroll: React.FC<DatePickerProps> = ({ onDateSelect, datePresent, theme, manualDate }) => {
    const [selectedDate, setSelectedDate] = useState<DateItem>(
        new Date(new Date(datePresent).setHours(0, 0, 0, 0))
    );
    const [isInitialScrollPerformed, setIsInitialScrollPerformed] = useState(false);

    const getIndexForDate = (date: DateItem) => dates.findIndex(d => isSameDay(d, date));
    useEffect(() => {
        const normalizedPropDate = new Date(new Date(datePresent).setHours(0, 0, 0, 0));

        // 1. Check if the prop date is different from the current selectedDate state
        if (!isSameDay(normalizedPropDate, selectedDate)) {
            setSelectedDate(normalizedPropDate); // Update state to reflect the prop change
            const newIndex = getIndexForDate(normalizedPropDate);

            // 2. Center the newly selected date (with animation this time, as it's a prop change)
            if (newIndex !== -1) {
                if (isInitialScrollPerformed) {
                    centerSelectedDate(newIndex, true); // true for animation
                }
            }
        }
    }, [datePresent, isInitialScrollPerformed]);

    const flatListRef = useRef<FlatList<DateItem>>(null);

    // --- 1. Generate the date range using native Date objects ---
    const generateDates = (): DateItem[] => {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const dates: DateItem[] = [];

        // Start 7 days before today
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 14);

        // Iterate through 16 days (7 back + Today + 8 forward = 16 items)
        for (let i = 0; i <= 22; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const dates: DateItem[] = generateDates();

    const initialIndex = dates.findIndex(date => isSameDay(date, datePresent));

    // --- 5. Styles ---
    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexDirection: 'row',
            paddingTop: 12,
        },
        dateItem: {
            padding: 16,
            paddingTop: 0,
            paddingHorizontal: 8,
            borderBottomWidth: 4,
            borderColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
        },
        selectedDateItem: {
            borderColor: colors.text[theme].primary,
        },
        dateText: {
            fontSize: 15,
            lineHeight: 20,
            // Note: 'Figtree-Bold' needs to be loaded in your project
            fontFamily: 'Figtree-Bold',
        },
    });

    // --- 2. Function to center the selected item ---
    const centerSelectedDate = (index: number, animated: boolean): void => {
        const requiredOffset = (SCREEN_WIDTH / 2) - (DATE_ITEM_WIDTH / 2);

        if (flatListRef.current && index >= 0 && index < dates.length) {
            flatListRef.current.scrollToIndex({
                animated: animated, // Use the animated flag
                index: index,
                viewOffset: requiredOffset,
                viewPosition: 0
            });
        }
    };

    // --- 3. Scroll to Center on initial load (with no visible animation) ---
    useEffect(() => {
        if (initialIndex !== -1 && !isInitialScrollPerformed) {
            // Use requestAnimationFrame to ensure layout is complete
            requestAnimationFrame(() => {
                // Set animated to FALSE to jump to the center position instantly.
                centerSelectedDate(initialIndex, false);
                setIsInitialScrollPerformed(true);
            });
        }
    }, [initialIndex, isInitialScrollPerformed]); // Added dependencies for correctness

    // --- 4. Render Item for FlatList, correctly typed ---
    const renderItem = ({ item: date, index }: ListRenderItemInfo<DateItem>) => {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const isCurrentDateSelected = isSameDay(date, selectedDate);

        let displayDateText: string;
        if (isSameDay(date, today)) {
            displayDateText = 'Today';
        } else if (isSameDay(date, yesterday)) {
            displayDateText = 'Yesterday';
        } else if (isSameDay(date, tomorrow)) {
            displayDateText = 'Tomorrow';
        } else {
            // Format as "Nov 6" using locale-specific date formatting
            displayDateText = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }

        const handlePress = () => {
            // Ensure the selected date is set to the start of the day for consistent comparison
            const newSelectedDate = new Date(date.getTime()); // Clone the date
            newSelectedDate.setHours(0, 0, 0, 0);

            setSelectedDate(newSelectedDate);
            // On user interaction, use animation (true)
            centerSelectedDate(index, true);
            onDateSelect(newSelectedDate);
        };

        return (
            <TouchableOpacity
                style={[
                    styles.dateItem,
                    { width: DATE_ITEM_WIDTH },
                    isCurrentDateSelected && styles.selectedDateItem,
                ]}
                onPress={handlePress}
            >
                <Text
                    numberOfLines={1}
                    maxFontSizeMultiplier={1}
                    style={[
                        styles.dateText,
                        { color: isCurrentDateSelected ? colors.text[theme].primary : colors.text[theme].tertiary },
                    ]}
                >
                    {displayDateText}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList<DateItem> // Specify the type of items in the FlatList
                ref={flatListRef}
                data={dates}
                renderItem={renderItem}
                keyExtractor={(item) => item.getTime().toString()} // Use getTime() for a unique key
                horizontal
                showsHorizontalScrollIndicator={false}
                getItemLayout={(data, index) => ({
                    length: DATE_ITEM_WIDTH,
                    offset: DATE_ITEM_WIDTH * index,
                    index,
                })}
            />
            {
                manualDate && (
                    <View style={{position: 'absolute', backgroundColor: colors.background[theme].elevated, width: '100%', paddingBottom: 3, paddingHorizontal: 8}}>
                        <View
                            style={[styles.dateItem, {
                                paddingTop: 8, paddingBottom: 8,
                                display: 'flex', flexDirection: 'row',
                                justifyContent: 'space-between', width: '100%', alignItems: 'flex-end'
                            }]}
                        >
                            <Text
                                numberOfLines={1}
                                maxFontSizeMultiplier={1.2}
                                style={[styles.dateText, {
                                    color: colors.text[theme].primary, textAlign: 'center',
                                    marginBottom: 0
                                },
                                ]}
                            >
                                {manualDate.toLocaleString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </Text>

                            <TouchableOpacity
                                onPress={() => {
                                    onDateSelect(new Date(), false);
                                }}
                                style={{
                                    borderRadius: 250,
                                    paddingVertical: 8,
                                    paddingHorizontal: 8,
                                    backgroundColor: colors.fills[theme].standard,
                                    alignSelf: 'flex-end',
                                }}>
                                <Text maxFontSizeMultiplier={1.2} style={{
                                    textAlign: 'center',
                                    color: colors.text[theme].primary,
                                    fontSize: 14,
                                    fontFamily: 'Figtree-SemiBold'
                                }}>
                                    Back to today
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        </View>
    );
};

export default DateScroll;