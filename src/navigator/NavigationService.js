import { NavigationActions, DrawerActions, StackActions } from 'react-navigation';
import { createRef } from 'react';
import { CommonActions } from '@react-navigation/native';

let _navigator;
let _paramScreen

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

// function navigate(routeName, params = {}, reset = false) {
//   console.log("navigate params:", params);
//   if (reset) {
//     const resetAction = StackActions.reset({
//       index: 0,
//       actions: [NavigationActions.navigate({ routeName: routeName, params: params })],
//     });
//     _navigator.dispatch(resetAction)
//   } else {
//     _navigator.dispatch(
//       NavigationActions.navigate({
//         routeName,
//         params,
//       })
//     );
//   }

// }

export const navigationRef = createRef();

export function navigate(name, params, reset = false) {
    console.log("navigate  navigationRef ===  ", navigationRef);

    if (reset == false)
        navigationRef.current?.navigate(name, params);
    else {
        setTimeout(() => {
            navigationRef.current?.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        { name: name, params: params },
                    ],
                })
            )
        }, 500);
    }

}

function closeDrawer() {
  _navigator.dispatch(
    DrawerActions.closeDrawer()
  );
}

getActiveRouteName = (navigationState) => {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];

  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}

getNavigator = () => {
  return _navigator;
}

export default {
  // navigate,
  setTopLevelNavigator,
  getNavigator,
  getActiveRouteName,
  closeDrawer,
};