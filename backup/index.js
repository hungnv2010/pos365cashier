'use strict';

import React, { useState, useEffect, forwardRef } from 'react';

import { StyleSheet, Platform, ViewPropTypes, Dimensions } from 'react-native';

import PropTypes from 'prop-types';

import { WebView } from 'react-native-webview';

import { reduceData, getWidth, isSizeChanged, shouldUpdate } from './utils';

const AutoHeightWebView = React.memo(
  forwardRef((props, ref) => {

    // start check tablet
    const msp = (dim, limit) => {
      return (dim.scale * dim.width) >= limit || (dim.scale * dim.height) >= limit;
    }

    const isTablet = () => {
      const dim = Dimensions.get("screen");
      return ((dim.scale < 2 && msp(dim, 1000) || (dim.scale >= 2 && msp(dim, 1900)))) ? 1 : 0;
    }

    const isPortrait = () => {
      const dim = Dimensions.get("screen");
      return dim.height >= dim.width ? true : false;
    }
    // end check tablet

    const { style, onMessage, onSizeUpdated, scrollEnabledWithZoomedin, scrollEnabled } = props;

    const [size, setSize] = useState({
      height: style && style.height ? style.height : 0,
      width: getWidth(style)
    });
    const [scrollable, setScrollable] = useState(false);
    const handleMessage = event => {
      onMessage && onMessage(event);
      if (!event.nativeEvent) {
        return;
      }
      let data = {};
      // Sometimes the message is invalid JSON, so we ignore that case
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch (error) {
        console.error(error);
        return;
      }
      let { height, width, zoomedin } = data;

      // check height
      // console.log("check height === ", height);
      if (Platform.OS == 'ios') {
        if (Platform.isPad == true) {
          if (isPortrait() == true)
            height = height / 3;
          else
            height = height / 3;
        }
        else
          height = height / 1.5
      }
      // end handler height tablet

      !scrollEnabled && scrollEnabledWithZoomedin && setScrollable(!!zoomedin);
      const { height: previousHeight, width: previousWidth } = size;
      isSizeChanged({ height, previousHeight, width, previousWidth }) &&
        setSize({
          height,
          width
        });
    };
    const currentScrollEnabled = scrollEnabled === false && scrollEnabledWithZoomedin ? scrollable : scrollEnabled;

    const { currentSource, script } = reduceData(props);

    const { width, height } = size;
    useEffect(
      () =>
        onSizeUpdated &&
        onSizeUpdated({
          height,
          width
        }),
      [width, height, onSizeUpdated]
    );

    return (
      <WebView
        {...props}
        ref={ref}
        onMessage={handleMessage}
        style={[
          styles.webView,
          {
            width,
            height
          },
          style
        ]}
        injectedJavaScript={script}
        source={currentSource}
        scrollEnabled={currentScrollEnabled}
      />
    );
  }),
  (prevProps, nextProps) => !shouldUpdate({ prevProps, nextProps })
);

AutoHeightWebView.propTypes = {
  onSizeUpdated: PropTypes.func,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      type: PropTypes.string,
      rel: PropTypes.string
    })
  ),
  style: ViewPropTypes.style,
  customScript: PropTypes.string,
  customStyle: PropTypes.string,
  viewportContent: PropTypes.string,
  scrollEnabledWithZoomedin: PropTypes.bool,
  // webview props
  originWhitelist: PropTypes.arrayOf(PropTypes.string),
  onMessage: PropTypes.func,
  scalesPageToFit: PropTypes.bool,
  source: PropTypes.object
};

let defaultProps = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  originWhitelist: ['*']
};

Platform.OS === 'android' &&
  Object.assign(defaultProps, {
    scalesPageToFit: false
  });

Platform.OS === 'ios' &&
  Object.assign(defaultProps, {
    viewportContent: 'width=device-width'
  });

AutoHeightWebView.defaultProps = defaultProps;

const styles = StyleSheet.create({
  webView: {
    backgroundColor: 'transparent'
  }
});

export default AutoHeightWebView;
