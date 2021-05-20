//
//  PrintTemp.m
//  Pos365Cashier
//
//  Created by HungNV on 5/14/21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PrintTemp.h"
#import "PrinterManager.h"

@implementation PrintTemp {
  NSString *TempCode;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(registerPrint:(NSString *)param) {
  NSLog(@"registerPrint param %@", param);
  TempCode = param;
}

@end
