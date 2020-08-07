import { StackActions, NavigationActions } from "react-navigation";
export function NavigateScreen(
  navigation,
  routerName,
  params = {},
  reset = false
) {
  if (
    navigation.state &&
    navigation.state.routeName != routerName &&
    routerName != ""
  ) {
    if (reset) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: routerName, params: params })
        ]
      });
      navigation.dispatch(resetAction);
    } else {
      navigation.navigate(routerName, params);
    }
  }
}

export const ScreenList = {

}

