import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import colors from "../../../colors";
import { useAuthContext } from "../../../contexts/AuthContext";
import { school } from "..";
import { schoolList } from "./GameCard";
import Svg, { Path } from "react-native-svg";

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

interface Scores {
    away: (number | string)[];
    home: (number | string)[];
}

const VolleyCard = React.memo(({ scores: initialScores, home, away }: { scores: Scores, home: string, away: string }) => {
    const { theme } = useAuthContext();
    const [templateHome, setTemplateHome] = useState<boolean>(false);
    const [templateAway, setTemplateAway] = useState<boolean>(false);
    const [localScores, setLocalScores] = useState<Scores>(initialScores);

    const getAccentColor = (schoolName: string) => {
        if (schoolList.includes(schoolName as school)) {
            return colors.schools[schoolName as school].accent;
        } else {
            return "#9A999E";
        }
    };

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
    
    useEffect(() => {
        const { away, home } = localScores;

        if (away.length === 2 && home.length === 2) {
            // Create new arrays to avoid mutating the state directly
            const newAway = [...away, "-"];
            const newHome = [...home, "-"];

            // Update the state with the new scores array
            setLocalScores({ away: newAway, home: newHome });
        }
    }, [initialScores])

    const styles = StyleSheet.create({
        setText: {
            color: colors.text[theme].secondary,
            textAlign: 'center',
            fontSize: 12,
            fontFamily: "Figtree-Medium",
        },
        scoreText: {
            fontSize: 15,
            fontFamily: 'Figtree-Bold',
            textAlign: 'center'
        },
    });

    return (
        <View style={{
            borderRadius: 24, padding: 16, width: '100%',
            marginBottom: 16,
            backgroundColor: colors.background[theme].elevated
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <View style={{width: 32, flexShrink: 1,}}>
                    <View style={{marginBottom: 16}}>
                        <Text style={{color: colors.text[theme].primary, fontFamily: 'Figtree-Bold', fontSize: 15, lineHeight: 18}}>Sets</Text>
                    </View>
                    <View style={{ maxWidth: 32, width: 32, maxHeight: 32, marginBottom: 4}}>
                        {templateHome ? (
                            <View style={{marginLeft: 2}}>
                                <Svg width="28" height="28" viewBox="0 0 24 25" fill="none">
                                    <Path d="M24 1.99999V8.99998C24 15.59 20.81 19.5837 18.1338 21.7737C15.2513 24.1312 12.3838 24.9324 12.2588 24.9649C12.0869 25.0117 11.9056 25.0117 11.7338 24.9649C11.6088 24.9324 8.745 24.1312 5.85875 21.7737C3.19 19.5837 0 15.59 0 8.99998V1.99999C0 1.46956 0.210714 0.960856 0.585786 0.585785C0.960859 0.210713 1.46957 0 2 0H22C22.5304 0 23.0391 0.210713 23.4142 0.585785C23.7893 0.960856 24 1.46956 24 1.99999Z" fill="#9A999E" />
                                </Svg>
                            </View>
                        ) : (
                            <Image
                                source={schoolLogos[home as school]}
                                width={28}
                                height={28}
                                style={{ width: 28, aspectRatio: 1, objectFit: 'contain', flexShrink: 1 }}
                            />
                        )}
                    </View>
                    <View style={{ maxWidth: 32, maxHeight: 32 }}>
                        {templateAway ? (
                            <View style={{ marginLeft: 2 }}>
                                <Svg width="28" height="28" viewBox="0 0 24 25" fill="none">
                                    <Path d="M24 1.99999V8.99998C24 15.59 20.81 19.5837 18.1338 21.7737C15.2513 24.1312 12.3838 24.9324 12.2588 24.9649C12.0869 25.0117 11.9056 25.0117 11.7338 24.9649C11.6088 24.9324 8.745 24.1312 5.85875 21.7737C3.19 19.5837 0 15.59 0 8.99998V1.99999C0 1.46956 0.210714 0.960856 0.585786 0.585785C0.960859 0.210713 1.46957 0 2 0H22C22.5304 0 23.0391 0.210713 23.4142 0.585785C23.7893 0.960856 24 1.46956 24 1.99999Z" fill="#9A999E" />
                                </Svg>
                            </View>
                        ) : (
                            <Image
                                source={schoolLogos[away as school]}
                                width={28}
                                height={28}
                                style={{ width: 28, aspectRatio: 1, objectFit: 'contain', flexShrink: 1 }}
                            />
                        )}
                    </View>
                </View>

                <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        {
                            localScores.home.map((score, index) => (
                                <View style={{ flexGrow: 1, height: 18, width: 18, display: 'flex', justifyContent: 'center', marginLeft: 20, }} key={index}>
                                    <Text key={index} style={styles.setText}>{index + 1}</Text>
                                </View>
                            ))
                        }
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        {
                            localScores.home.map((score, index) => (
                                <View style={{
                                    flexGrow: 1, display: 'flex', justifyContent: 'center', paddingVertical: 4, marginLeft: 16, borderRadius: 250,
                                    backgroundColor: score > localScores.away[index] ? getAccentColor(home) : 'transparent'
                                 }} key={index}>
                                    <Text key={index}
                                        style={{
                                            ...styles.scoreText,
                                            color: score > localScores.away[index] ? colors.system.white : colors.text[theme].secondary
                                        }}
                                    >{score}</Text>
                                </View>
                            ))
                        }
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        {
                            localScores.away.map((score, index) => (
                                <View style={{
                                    flexGrow: 1, display: 'flex', justifyContent: 'center', paddingVertical: 4, marginLeft: 16, borderRadius: 250,
                                    backgroundColor: score > localScores.home[index] ? getAccentColor(away) : 'transparent'
                                }} key={index}>
                                    <Text key={index}
                                        style={{
                                            ...styles.scoreText,
                                            color: score > localScores.home[index] ? colors.system.white : colors.text[theme].secondary
                                        }}
                                    >{score}</Text>
                                </View>
                            ))
                        }
                    </View>
                </View>
            </View>
        </View>
    );
})



export default VolleyCard;
