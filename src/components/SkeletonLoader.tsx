import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface skeletonProp {
    height: number;
    width?: number;
    borderRadius: number;
}

const SkeletonLoader: React.FC<skeletonProp> = ({ height, width, borderRadius }) => {
    return (
        <View style={{ width: width ? width : '100%', height: height, backgroundColor: '#FFFFFF0D', borderRadius: borderRadius }}>
        </View>
    );
};

export default SkeletonLoader;
