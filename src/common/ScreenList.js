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
  Login: "Login",
  Home: "Home",
  ServedForTablet: "ServedForTablet",
  PrintHtml: "PrintHtml",
  Preview: "Preview",
  Topping: "Topping",
  NoteBook: "NoteBook",
  DetailNoteBook: "DetailNoteBook",
  QRCode: "QRCode",
  PageServed: "PageServed",
  SelectProduct: "SelectProduct",
  Main: "Main",
  ChangeTable: "ChangeTable",
  DetailHistory: "DetailHistory",
  PrintWebview: "PrintWebview",
  OrderNow: "OrderNow",
  History: "History",
  More: "More",
  RoomCatalog: "RoomCatalog",
  RoomList: "RoomList",
  RoomCategory: "RoomCategory",
  RoomDetail: "RoomDetail",
  OverView: "OverView",
  Invoice: "Invoice",
  CashFlow: "CashFlow",
  InvoiceDetail:"InvoiceDetail",
  Payment: "Payment"
}

