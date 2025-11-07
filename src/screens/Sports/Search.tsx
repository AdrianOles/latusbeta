import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, View, Image, Modal, TouchableOpacity, Platform, Pressable, FlatList, Dimensions, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { AuthContextType, useAuthContext } from '../../contexts/AuthContext';
import { signOut, signIn } from 'aws-amplify/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation';
import { Picker } from '@react-native-picker/picker';
import Sports, { school } from './index';
import * as Haptics from 'expo-haptics';
import NoResults from './components/NoResults';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const sports = ['soccer', 'football', 'volleyball', 'field hockey', 'basketball', 'lacrosse', 'rugby',
    'fastpitch', 'slowpitch', 'baseball', 'eSports', 'curling']

interface HeaderProps {
    theme: 'light' | 'dark'; // Use the correct type for your theme
    onSelectPress: () => void;
    selectedSport: string | null;
    school: string;
    onSchoolChange: (text: string) => void;
    onSearch: () => void;
    search: string | null
}

type dataFormat = {
    mainLabel: string,  //"Senior Boys Soccer"
    subLabel: string | null,   //"HCAA League" if null, "SCHOOL" otherwise
}

// 1. Move the Header component OUTSIDE of the Search component
const Header = React.memo(({ theme, onSelectPress, selectedSport, school, onSchoolChange, onSearch, search }: HeaderProps) => {
    return (
        <View style={{ paddingVertical: 0, paddingHorizontal: 16, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => { Keyboard.dismiss(); onSelectPress() }} style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingVertical: 12, paddingHorizontal: 24, borderRadius: 250, borderWidth: 1, borderColor: colors.fills[theme].stroke
            }}>
                <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22, color: colors.text[theme].secondary }}>
                    {selectedSport ? selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1) : "Select a Sport"}
                </Text>
                <Ionicons name='chevron-down' size={18} color={colors.text[theme].secondary} />
            </TouchableOpacity>
            <View style={{ position: 'relative' }}>
                <TextInput
                    placeholder="Search a school"
                    keyboardType="default"
                    inputMode='text'
                    maxLength={450}
                    editable={selectedSport ? true : false}
                    value={school}
                    onSubmitEditing={onSearch}
                    returnKeyType="search"
                    placeholderTextColor={colors.text[theme].tertiary}
                    onChangeText={onSchoolChange}
                    style={{
                        paddingVertical: 12, paddingHorizontal: 24, borderRadius: 250, borderWidth: 1, borderColor: colors.fills[theme].stroke,
                        fontSize: 17, fontFamily: 'Figtree-Medium', lineHeight: 22, marginTop: 8, paddingLeft: 44, color: colors.text[theme].primary,
                        backgroundColor: selectedSport ? 'transparent' : colors.fills[theme].standard, opacity: selectedSport ? 1 : 0.5
                    }}
                />
                <Ionicons name='search-outline' color={colors.text[theme].secondary} size={20} style={{ position: 'absolute', left: 0, top: '50%', opacity: selectedSport ? 1 : 0.5, transform: [{ translateY: -5 }], paddingLeft: 16 }} />
                {
                    school && (
                        <TouchableOpacity onPress={() => onSchoolChange('')} style={{ position: 'absolute', top: '50%', right: 0, transform: [{ translateY: -7 }], paddingRight: 16 }}>
                            <Ionicons name='close-outline' color={colors.text[theme].secondary} size={24} />
                        </TouchableOpacity>
                    )
                }
            </View>
            {search && (
                <>
                    <Text style={{ marginTop: 32, fontFamily: 'Figtree-Medium', fontSize: 15, color: colors.text[theme].secondary }}>
                        <Text style={{ textTransform: 'capitalize', fontFamily: 'Figtree-Bold' }}>{selectedSport}</Text> results for
                    </Text>
                    <Text style={{ color: colors.text[theme].primary, fontSize: 22, lineHeight: 28, fontFamily: "Figtree-Bold" }}>"{search}"</Text>
                </>
            )}
            {selectedSport && !search && (
                <Text style={{ color: colors.text[theme].primary, fontSize: 22, lineHeight: 28, fontFamily: "Figtree-Bold", textTransform: 'capitalize', paddingVertical: 16, paddingTop: 32 }}>{selectedSport}</Text>
            )}
        </View>
    );
});

const schoolLogos = {
    "St. Thomas Aquinas": require('../../../assets/schools/sta.png'),
    "St. Ignatius of Loyola": require('../../../assets/schools/loy.png'),
    "Notre Dame": require('../../../assets/schools/nd.png'),
    "Bishop Reding": require('../../../assets/schools/br.png'),
    "Holy Trinity": require('../../../assets/schools/ht.png'),
    "Assumption": require('../../../assets/schools/as.png'),
    "Corpus Christi": require('../../../assets/schools/cc.png'),
    "St. Francis Xavier": require('../../../assets/schools/stfx.png'),
    "St. Kateri Tekakwitha": require('../../../assets/schools/stk.png'),
    "Christ the King": require('../../../assets/schools/ctk.png'),
};

interface CardProps {
    label: string,
    subNote: string | null,
    theme: 'light' | 'dark',
}

const getLeagueId = (leagueName: string): string => {
    switch (leagueName) {
        case "Senior Girls Field Hockey":
            return "8";
        case "Varsity Boys Baseball":
            return "26";
        case "Junior Boys Football":
            return "1";
        case "Senior Boys Football":
            return "2";
        default:
            return "26";
    }
}

const ResultCard = ({ label, subNote, theme }: CardProps) => {
    const navigation = useNavigation<HomeStackParamList>();

    const handleRedirect = () => {
        if (subNote) {
            navigation.navigate("SportsTeam", {
                team: subNote, org: "HCAA", league: label
            })
        } else {
            navigation.navigate("SportsLeague", {
                org: "HCAA", league: label
            })
        }
    }

    return (
        <TouchableOpacity onPress={handleRedirect} style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16,
            borderRadius: 20, backgroundColor: !subNote ? colors.fills[theme].standard: colors.schools[subNote as school][theme].primary,
            marginHorizontal: 16, marginBottom: 16
        }}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View>
                    <Image
                        source={subNote ? schoolLogos[subNote as school] : require('../../../assets/schools/hcaa.png')}
                        style={{ height: 32, aspectRatio: 1, objectFit: 'contain' }}
                    />
                </View>
                <View style={{ marginLeft: 8 }}>
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, color: !subNote ? colors.text[theme].primary : 'white', textTransform: 'capitalize' }}>{label}</Text>
                    <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, color: !subNote ? colors.text[theme].secondary : '#FFFFFFA6' }}>{subNote ? subNote : "HCAA League"}</Text>
                </View>
            </View>
            {/* <TouchableOpacity style={{ padding: 4 }} onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}>
                <Ionicons name='star-outline' size={24} color={colors.text[theme].primary} />
            </TouchableOpacity> */}
        </TouchableOpacity>
    )
}

const getLeague = (league: string): dataFormat[] | null => {
    switch (league) {
        case "soccer":
            return [
                { mainLabel: "Senior Boys Soccer", subLabel: null },
                { mainLabel: "Senior Girls Soccer", subLabel: null },
                { mainLabel: "Junior Boys Soccer", subLabel: null },
                { mainLabel: "Junior Girls Soccer", subLabel: null },
            ];
        case "football":
            return [
                { mainLabel: "Senior Boys Football", subLabel: null },
                { mainLabel: "Junior Boys Football", subLabel: null },
            ];
        case "volleyball":
            return [
                { mainLabel: "Senior Boys Volleyball", subLabel: null },
                { mainLabel: "Senior Girls Volleyball", subLabel: null },
                { mainLabel: "Junior Boys Volleyball", subLabel: null },
                { mainLabel: "Junior Girls Volleyball", subLabel: null },
                { mainLabel: "Novice Girls Volleyball", subLabel: null },
            ];
        case "field hockey":
            return [
                { mainLabel: "Senior Girls Field Hockey", subLabel: null },
                { mainLabel: "Junior Girls Field Hockey", subLabel: null },
            ];
        case "basketball":
            return [
                { mainLabel: "Senior Boys Basketball", subLabel: null },
                { mainLabel: "Senior Girls Basketball", subLabel: null },
                { mainLabel: "Junior Boys Basketball", subLabel: null },
                { mainLabel: "Junior Girls Basketball", subLabel: null },
                { mainLabel: "Novice Boys Basketball", subLabel: null },
            ];
        case "lacrosee":
            return [
                { mainLabel: "Varsity Boys Lacrosee", subLabel: null }
            ];
        case "rugby":
            return [
                { mainLabel: "Senior Girls Rugby", subLabel: null }
            ];
        case "fastpitch":
            return [
                { mainLabel: "Varsity Girls Fastpitch", subLabel: null }
            ];
        case "slowpitch":
            return [
                { mainLabel: "Varsity Girls Slowpitch", subLabel: null }
            ];
        case "baseball":
            return [
                { mainLabel: "Varsity Boys Baseball", subLabel: null }
            ];
        case "eSports":
            return [
                { mainLabel: "Tier 1 Varsity Co-Ed eSports", subLabel: null },
                { mainLabel: "Tier 2 Varsity Co-Ed eSports", subLabel: null },
            ];
        case "curling":
            return [
                { mainLabel: "Varsity Boys Curling", subLabel: null },
                { mainLabel: "Varsity Girls Curling", subLabel: null },
                { mainLabel: "Novice Co-Ed Curling", subLabel: null },
            ];
        default:
            return null;
    }
}

const schoolList = [
    "Assumption", "Bishop Reding", "Christ the King", "Holy Trinity", "Corpus Christi",
    "St. Francis Xavier", "Notre Dame", "St. Ignatius of Loyola", "St. Thomas Aquinas", "St. Kateri Tekakwitha"
]

const Search = () => {
    const { authUser, updateAuthUser, updateSchool, theme }: AuthContextType = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const [loading, setLoading] = useState(false);
    const [selectedSport, setSport] = useState<null | string>(null);
    const [openSelect, setSelect] = useState<boolean>(false);
    const pickerRef = useRef<Picker<string | null> | null>(null);
    const [school, setSchool] = useState<string>(''); // or just ''
    const [showResults, setShowResults] = useState<string | null>('');
    const [showSport, setSportResult] = useState<string | null>(null);
    const [data, setData] = useState<dataFormat[] | null>(null);

    const handleRefresh = async () => {
        setLoading(true);
        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
    };

    useEffect(() => {
        let leagueData: dataFormat[] | null = [];
        if (selectedSport) {
            leagueData = getLeague(selectedSport) || [];
        }

        if (showResults) {
            // Updated normalization
            const normalizedSearch = showResults.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

            const matchingSchool = schoolList.find(school => {
                // Updated normalization
                const normalizedSchool = school.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                return normalizedSchool.includes(normalizedSearch);
            });

            if (matchingSchool) {
                // Create a new array for the school's teams, populating the subLabel
                const schoolTeams = leagueData.map(team => ({
                    ...team,
                    subLabel: matchingSchool,
                }));

                // Prepend the school teams to the original league data
                setData([...schoolTeams, ...leagueData]);
            } else {
                setData(leagueData);
            }
        } else {
            // If there's no search, just set the league data
            setData(leagueData);
        }
    }, [selectedSport, showResults]);

    // Memoize the callback functions
    const handleSchoolChange = useCallback((text: string) => {
        setSchool(text);
    }, []);

    const handleSearch = useCallback(() => {
        setShowResults(school);
    }, [school]);

    // Memoize the Header component to pass to the FlatList
    const memoizedHeader = useMemo(() => {
        return (
            <Header
                theme={theme}
                selectedSport={selectedSport}
                onSelectPress={() => setSelect(true)}
                school={school}
                onSchoolChange={handleSchoolChange}
                onSearch={handleSearch}
                search={showResults}
            />
        );
    }, [theme, selectedSport, school, handleSchoolChange, handleSearch, showResults]);

    return (
        <SafeAreaView edges={["top"]} style={{ position: 'relative', backgroundColor: colors.background[theme].elevated, height: '100%' }}>
            <Modal
                visible={openSelect}
                transparent={true}
                animationType="none"
                onRequestClose={() => setSelect(false)}
            >
                <Pressable
                    onPress={() => setSelect(false)}
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: '#000000A0',
                    }}
                >
                    <Pressable
                        onPress={() => { }} // This prevents closing the modal when tapping the content
                        style={{
                            backgroundColor: colors.background[theme].elevated,
                            borderTopRightRadius: 16,
                            borderTopLeftRadius: 16,
                            paddingBottom: 40,
                        }}
                    >
                        <Picker
                            selectedValue={selectedSport}
                            onValueChange={(itemValue, itemIndex) => {
                                if (itemValue !== null) {
                                    setSport(itemValue);
                                }
                            }}
                            itemStyle={{ color: colors.text[theme].primary }}
                        >
                            <Picker.Item label="Select a sport" value={null} />
                            {sports.map((item, index) => (
                                <Picker.Item
                                    label={item.charAt(0).toUpperCase() + item.slice(1)}
                                    value={item}
                                    key={index}
                                />
                            ))}
                        </Picker>
                        <TouchableOpacity
                            onPress={() => {
                                setSelect(false);
                                setSportResult(selectedSport);
                            }}
                            style={{
                                marginHorizontal: 16,
                                borderRadius: 250,
                                backgroundColor: '#526CFF',
                                paddingVertical: 12,
                                paddingHorizontal: 20,
                                marginTop: 16
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontFamily: 'Figtree-SemiBold',
                                fontSize: 15,
                                lineHeight: 20,
                                textAlign: 'center'
                            }}>
                                Done
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            <Pressable onPress={Keyboard.dismiss} style={{ borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: 1, backgroundColor: colors.background[theme].elevated }}>
                <View style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'center', paddingHorizontal: 12, width: '100%', paddingVertical: 16,
                }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
                        <Ionicons name='chevron-back-outline' size={24} color={colors.text[theme].primary} />
                    </TouchableOpacity>
                    <Text style={{ textAlign: 'center', fontFamily: 'Figtree-Bold', fontSize: 17, color: colors.text[theme].primary }}>Find a team</Text>
                    <Ionicons name='chevron-back-outline' size={24} color={colors.text[theme].primary} style={{ opacity: 0, width: 40 }} />
                </View>
            </Pressable>

            <FlatList
                data={data} // replace with your data
                style={{ height: '100%', paddingTop: 32, backgroundColor: colors.background[theme].general }}
                renderItem={({ item, index }) => (
                    <ResultCard
                        label={`${item.mainLabel}`}
                        subNote={item.subLabel}
                        theme={theme}
                    />
                )}
                contentContainerStyle={{paddingBottom: 100}}
                ListEmptyComponent={<NoResults theme={theme} mainLabel={'Empty search'} subLabel={'Please select a sport first'} />}
                ListHeaderComponent={memoizedHeader}
                refreshing={loading}
                onRefresh={handleRefresh}
            />

        </SafeAreaView>
    )
}

export default Search