import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, View, Modal, TouchableOpacity, Platform, Pressable, FlatList, Dimensions, Keyboard } from 'react-native'
import { AuthContextType, useAuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation';
import { Picker } from '@react-native-picker/picker';
import { school } from './index';
import NoResults from './components/NoResults';
import { Image } from 'expo-image';
// import * as Haptics from 'expo-haptics';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const sports = ['soccer', 'football', 'volleyball', 'hockey', 'field hockey', 'basketball', 'lacrosse', 'rugby',
    'fastpitch', 'slowpitch', 'baseball', 'eSports', 'curling']

interface HeaderProps {
    theme: 'light' | 'dark';
    onSelectPress: () => void;
    selectedSport: string | null;
    school: string | null;
    onSchoolSelectPress: () => void;
    onClearSchool: () => void;
    onClearSport: () => void;
    search: string | null;
}

type dataFormat = {
    mainLabel: string,
    subLabel: string | null,
}

const Header = React.memo(({ theme, onSelectPress, selectedSport, school, onSchoolSelectPress, onClearSchool, onClearSport, search }: HeaderProps) => {
    return (
        <View style={{ paddingVertical: 0, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.background[theme].elevated }}>
            <TouchableOpacity onPress={() => { Keyboard.dismiss(); onSelectPress() }} style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 borderRadius: 250, borderWidth: 1, borderColor: colors.fills[theme].stroke
            }}>
                <Text maxFontSizeMultiplier={1.2} style={{ paddingVertical: 12, paddingHorizontal: 24, fontFamily: selectedSport ? 'Figtree-SemiBold' : 'Figtree-Medium', fontSize: 17, lineHeight: 22, color: selectedSport ? colors.text[theme].primary : colors.text[theme].tertiary }}>
                    {selectedSport ? selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1) : "Select a Sport"}
                </Text>
                {selectedSport ? (
                    <TouchableOpacity onPress={onClearSport} style={{ marginRight: -2, paddingRight: 24, paddingVertical: 12}}>
                        <Ionicons name='close-outline' color={colors.text[theme].secondary} size={20} />
                    </TouchableOpacity>
                ) : (
                        <Ionicons name='chevron-down' size={18} color={colors.text[theme].secondary} style={{ paddingRight: 24, paddingVertical: 12 }} />
                )}
            </TouchableOpacity>

            <View style={{ position: 'relative', marginTop: 8 }}>
                <TouchableOpacity
                    disabled={!selectedSport}
                    onPress={() => { Keyboard.dismiss(); onSchoolSelectPress(); }}
                    style={{
                       borderRadius: 250, borderWidth: 1, borderColor: colors.fills[theme].stroke,
                        backgroundColor: selectedSport ? 'transparent' : colors.fills[theme].standard, opacity: selectedSport ? 1 : 0.5,
                        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text maxFontSizeMultiplier={1.2} style={{
                            paddingVertical: 12, paddingHorizontal: 24, 
                            fontSize: 17, fontFamily: school ? 'Figtree-SemiBold' : 'Figtree-Medium', color: school ? colors.text[theme].primary : colors.text[theme].tertiary,
                        }}>
                            {school ? school : "Select a school"}
                        </Text>
                    </View>

                    {school ? (
                        <TouchableOpacity onPress={onClearSchool} style={{ paddingVertical: 12, paddingHorizontal: 24, }}>
                            <Ionicons name='close-outline' color={colors.text[theme].secondary} size={20} />
                        </TouchableOpacity>
                    ) : (
                        <Ionicons name='chevron-down' size={18} color={colors.text[theme].secondary} style={{ paddingRight: 24, paddingVertical: 12 }} />
                    )}
                </TouchableOpacity>
            </View>
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

    const abbreviatedLabel = label.replace(/\bSenior\b/g, 'Sr.').replace(/\bJunior\b/g, 'Jr.');

    return (
        <TouchableOpacity onPress={handleRedirect} style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16,
            borderRadius: 20, backgroundColor: !subNote ? colors.background[theme].elevated : colors.schools[subNote as school][theme].primary,
            marginHorizontal: 16, marginBottom: 16
        }}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View>
                    <Image
                        source={subNote ? schoolLogos[subNote as school] : require('../../../assets/schools/hcaa.png')}
                        style={{ height: 32, aspectRatio: 1 }}
                        contentFit='contain'
                        transition={300}
                    />
                </View>
                <View style={{ marginLeft: 8 }}>
                    <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, color: !subNote ? colors.text[theme].primary : 'white', textTransform: 'capitalize' }}>{abbreviatedLabel}</Text>
                    <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: 'Figtree-Medium', fontSize: 13, color: !subNote ? colors.text[theme].secondary : '#FFFFFFA6' }}>{subNote ? subNote : "HCAA League"}</Text>
                </View>
            </View>
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
        case "lacrosse":
            return [
                { mainLabel: "Varsity Boys Lacrosse", subLabel: null }
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
        case "hockey":
            return [
                { mainLabel: "Varsity Boys Hockey", subLabel: null },
                { mainLabel: "Varsity Girls Hockey", subLabel: null },
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

    const [school, setSchool] = useState<string | null>(null);
    const [openSchoolSelect, setSchoolSelect] = useState<boolean>(false);

    const [showResults, setShowResults] = useState<string | null>('');
    const [showSport, setSportResult] = useState<string | null>(null);
    const [data, setData] = useState<dataFormat[] | null>(null);

    const [empty, setEmpty] = useState(false);

    useEffect(() => {
        if (showResults) setEmpty(false);
        else setEmpty(true);
    }, [showResults])

    const handleRefresh = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
    };

    useEffect(() => {
        let leagueData: dataFormat[] | null = [];
        if (selectedSport) {
            leagueData = getLeague(selectedSport) || [];
        }

        if (showResults) {
            const normalizedSearch = showResults.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

            const matchingSchools = schoolList.filter(s => {
                const normalizedSchool = s.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                return normalizedSchool.includes(normalizedSearch);
            });

            if (matchingSchools.length > 0) {
                const prioritizedTeams: dataFormat[] = [];
                matchingSchools.forEach(matchingSchool => {
                    const schoolTeams = leagueData.map(team => ({
                        ...team,
                        subLabel: matchingSchool,
                    }));
                    prioritizedTeams.push(...schoolTeams);
                });
                setData([...prioritizedTeams, ...leagueData]);
            } else {
                setData(leagueData);
            }
        } else {
            setData(leagueData);
        }
    }, [selectedSport, showResults]);

    useEffect(() => {
        setShowResults(null);
    }, [school])

    const handleClearSchool = useCallback(() => {
        setSchool(null);
        setShowResults(null);
        setSchoolSelect(false);
    }, []);

    const handleSearch = useCallback(() => {
        setShowResults(school);
    }, [school]);

    const handleClearSport = useCallback(() => {
        setSchoolSelect(false);
        setSport(null);
        setShowResults(null);
        setSelect(false);
    }, []);

    const memoizedHeader = useMemo(() => {
        return (
            <Header
                theme={theme}
                selectedSport={selectedSport}
                onSelectPress={() => setSelect(true)}
                school={school}
                onSchoolSelectPress={() => setSchoolSelect(true)}
                onClearSchool={handleClearSchool}
                onClearSport={handleClearSport}
                search={showResults}
            />
        );
    }, [theme, selectedSport, school, handleClearSchool, handleSearch, showResults]);

    return (
        <SafeAreaView edges={["top"]} style={{ position: 'relative', backgroundColor: colors.background[theme].elevated, height: '100%' }}>

            {/* Sport Picker Modal */}
            <Modal
                visible={openSelect}
                transparent={true}
                animationType="none"
                onRequestClose={() => setSelect(false)}
            >
                <Pressable
                    onPress={() => setSelect(false)}
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#000000A0' }}
                >
                    <Pressable
                        onPress={() => { }}
                        style={{ backgroundColor: colors.background[theme].elevated, borderTopRightRadius: 16, borderTopLeftRadius: 16, paddingBottom: 40 }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexGrow: 1, width: '100%' }}>
                            <TouchableOpacity onPress={handleClearSport} style={{ padding: 24 }}>
                                <Text maxFontSizeMultiplier={1.5} style={{ color: colors.text[theme].secondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setSelect(false);
                                setSportResult(selectedSport);
                            }} style={{ padding: 24 }}>
                                <Text maxFontSizeMultiplier={1.5} style={{ color: colors.system[theme].blue }}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: Platform.OS === "android" ? 16 : 0 }}>
                            <Picker
                                selectedValue={selectedSport}
                                onValueChange={(itemValue) => {
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
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* School Picker Modal */}
            <Modal
                visible={openSchoolSelect}
                transparent={true}
                animationType="none"
                onRequestClose={() => setSchoolSelect(false)}
            >
                <Pressable
                    onPress={() => setSchoolSelect(false)}
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#000000A0' }}
                >
                    <Pressable
                        onPress={() => { }}
                        style={{ backgroundColor: colors.background[theme].elevated, borderTopRightRadius: 16, borderTopLeftRadius: 16, paddingBottom: 40 }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexGrow: 1, width: '100%' }}>
                            <TouchableOpacity onPress={handleClearSchool} style={{ padding: 24 }}>
                                <Text maxFontSizeMultiplier={1.5} style={{ color: colors.text[theme].secondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setSchoolSelect(false);
                                handleSearch();
                            }} style={{ padding: 24 }}>
                                <Text maxFontSizeMultiplier={1.5} style={{ color: colors.system[theme].blue }}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: Platform.OS === "android" ? 16 : 0 }}>
                            <Picker
                                selectedValue={school}
                                onValueChange={(itemValue) => {
                                    setSchool(itemValue);
                                }}
                                itemStyle={{ color: colors.text[theme].primary }}
                            >
                                <Picker.Item label="Select a school" value={null} />
                                {schoolList.map((item, index) => (
                                    <Picker.Item
                                        label={item}
                                        value={item}
                                        key={index}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Pressable onPress={Keyboard.dismiss} style={{ backgroundColor: colors.background[theme].elevated }}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, width: '100%', paddingVertical: 16 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
                        <Ionicons name='chevron-back-outline' size={24} color={colors.text[theme].primary} />
                    </TouchableOpacity>
                    <Text maxFontSizeMultiplier={1.2} style={{ textAlign: 'center', fontFamily: 'Figtree-Bold', fontSize: 17, color: colors.text[theme].primary }}>Find a team</Text>
                    <Ionicons name='chevron-back-outline' size={24} color={colors.text[theme].primary} style={{ opacity: 0, width: 40 }} />
                </View>
                 <Header
                    theme={theme}
                    selectedSport={selectedSport}
                    onSelectPress={() => setSelect(true)}
                    school={school}
                    onSchoolSelectPress={() => setSchoolSelect(true)}
                    onClearSchool={handleClearSchool}
                    onClearSport={() => {
                        setSchoolSelect(false);
                        setSport(null);
                        setShowResults(null);
                    }}
                    search={showResults}
                />
            </Pressable>

            <FlatList
                data={data}
                contentContainerStyle={{ paddingVertical: 16 }}
                style={{ height: '100%',backgroundColor: colors.background[theme].alternate }}
                renderItem={({ item, index }) => (
                    <ResultCard
                        label={`${item.mainLabel}`}
                        subNote={item.subLabel}
                        theme={theme}
                    />
                )}
                ListEmptyComponent={<NoResults empty={empty} theme={theme} mainLabel={'Empty search'} subLabel={'Please select a sport first'} />}
                // ListHeaderComponent={
                //     <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                //         <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 17, color: colors.text[theme].primary }}>Results</Text>
                //     </View>
                // }
                refreshing={loading}
                onRefresh={handleRefresh}
            />
        </SafeAreaView>
    )
}

export default Search