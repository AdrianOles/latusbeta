import { View, Text, TouchableOpacity, Dimensions } from "react-native"
import colors from "../colors";
import { Ionicons } from '@expo/vector-icons';

interface Props {
    theme: 'light' | 'dark';
    active: boolean;
    onPress: () => void;
}

const SCREEN_WIDTH = Dimensions.get('screen').width;

const ErrorBanner: React.FC<Props> = ({theme, active, onPress}) => {
    return (
        <View style={{
            position: 'absolute', bottom: 200, zIndex: 10, left: 0, width: SCREEN_WIDTH, paddingHorizontal: 16
        }}>
            <View style={{
                padding: 12, display: active ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'center',
                alignItems: 'center', backgroundColor: colors.system[theme].red, flexShrink: 1
            }}>
                <Text style={{ fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20, color: colors.system.white, flexShrink: 1 }}>
                    Sorry, looks like something went wrong. Please try again later.
                </Text>
                <TouchableOpacity onPress={onPress} style={{ padding: 10 }}>
                    <Ionicons name="close-outline" size={20} color={colors.system.white} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ErrorBanner;