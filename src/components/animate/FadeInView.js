import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';

export default function FadeInView(props) {
  const [fadeAnim, setfadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(                  // Animate over time
      fadeAnim,            // The animated value to drive
      {
        toValue: 1,                   // Animate to opacity: 1 (opaque)
        duration: 300,              // Make it take a while
        useNativeDriver: true
      }
    ).start();
  }, [])

  return (
    <Animated.View                 // Special animatable View
      style={[...props.style,
      { opacity: fadeAnim }]}
    >
      {props.children}
    </Animated.View>
  );
}