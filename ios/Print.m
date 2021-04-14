//
//  Print.m
//  Pos365Order
//
//  Created by HungNV on 5/18/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Print.h"
#import <WebKit/WebKit.h>
#import "TSCCmd.h"
#import "PrinterManager.h"

@interface Print ()
{
  PrinterManager * _printerManager;
  UIImage *imagePrint;
  UIImage *imagePrintClient;
  
  UIImage *imagePrint1;
  UIImage *imagePrint2;
  UIImage *imagePrint3;
}
@end

@implementation Print {
  bool isConnectAndPrint;
  WKWebView * webView;
  NSString *html;
  NSString *IP;
  NSInteger SizeInput;
  bool hasListeners;
  NSMutableArray *imageArray;
  bool PrintImageClient;
  bool PrintClose;
  bool isLocalNetwork;
  NSMutableArray *images;
  
  bool isHtml;
  
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(registerPrint:(NSString *)param) {
  NSLog(@"registerPrint param %@", param);
//  NSArray *arrayOfComponents = [param componentsSeparatedByString:@"_"];
//  IP = arrayOfComponents[0];
//  SizeInput = [arrayOfComponents[1] integerValue];
//  NSLog(@"registerPrint IP %@", IP);
//  NSLog(@"registerPrint SizeInput %ld", (long)SizeInput);
//  isConnectAndPrint = NO;
  _printerManager = [PrinterManager sharedInstance];
  [_printerManager AddConnectObserver:self selector:@selector(handleNotification:)];//Add
}

RCT_EXPORT_METHOD(printImageFromClient:(NSString *)param ip:(NSString *)ip size:(NSString *)size isCopies:(NSString *)isCopies callback:(RCTResponseSenderBlock)callback) {
  NSLog(@"printImageFromClient param %@ ip %@", param, ip);
//  PrintClose = YES;
  isLocalNetwork = NO;
//  [_printerManager.CurrentPrinter Close];
  PrintImageClient = YES;
  isConnectAndPrint = YES;
  isHtml = NO;
  PrintClose = NO;
  IP = ip;
  if(![size isEqualToString:@""]){
    SizeInput = [size integerValue];
    if(SizeInput > 72) {
      SizeInput = 72;
    }else if(SizeInput < 58){
      SizeInput = 58;
    }
  }else {
    SizeInput = 72;
  }
  [_printerManager DoConnectwifi:ip Port:9100];
  
  NSURL *URL = [RCTConvert NSURL:param];
  NSLog(@"printImageFromClient URL %@", URL);
  NSData *imgData = [[NSData alloc] initWithContentsOfURL:URL];
  
  imagePrintClient = [[UIImage alloc] initWithData:imgData];
  NSLog(@"printImageFromClient imagePrintClient %@", imagePrintClient);
  [self printClient: isCopies];
  callback(@[@"Done"]);
}

RCT_EXPORT_METHOD(requestLocalNetwork:(NSString *)ip) {
  PrintClose = YES;
  isLocalNetwork = YES;
  [_printerManager DoConnectwifi:ip Port:9100];
}

RCT_EXPORT_METHOD(printImage:(NSString *)param) {
  NSLog(@"printImage param %@", param);
  html = param;
//  html =  @"Hung ok";
  NSLog(@"printImage html %@", html);
  isConnectAndPrint = YES;
  isHtml = YES;
  [_printerManager DoConnectwifi:IP Port:9100];
  
}

RCT_EXPORT_METHOD(openAppOrder: (RCTResponseSenderBlock)callback) {
  NSString *customURL = @"orderapp://";
  UIApplication *application = [UIApplication sharedApplication];
  NSURL *URL = [NSURL URLWithString:@"orderapp://"];
  if ([application respondsToSelector:@selector(openURL:options:completionHandler:)])
  {
    [application openURL:URL options:@{}
       completionHandler:^(BOOL success) {
      NSLog(@"Open %@: %d",customURL,success);
    }];
    callback(@[@"true"]);
  }
  else {
    callback(@[@"false"]);
  }
}

RCT_EXPORT_METHOD(keepTheScreenOn:(NSString *)param) {

  NSLog(@"setIdleTimerDisabled YES");
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setIdleTimerDisabled: YES];
  });
}

RCT_EXPORT_METHOD(keepTheScreenOff:(NSString *)param) {

  NSLog(@"setIdleTimerDisabled NO");
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setIdleTimerDisabled: NO];
  });
}

- (void) printClient: (NSString *)isCopies {
//  images = [@[] mutableCopy];
//
//  float i_width = 1000;
////  float oldWidth = imagePrintClient.size.width;
////  float oldHeight = imagePrintClient.size.height;
////
////  float scaleFactor = i_width / oldWidth;
////  float newHeight = oldHeight * scaleFactor;
////  float newWidth = oldWidth * scaleFactor;
////  UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
////  [imagePrintClient drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
////  UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
////  imagePrintClient = newImage;
////  NSLog(@"printImageFromClient URL 1");
//  CGImageRef tmpImgRef = imagePrintClient.CGImage;
//  int numberArrayImage = 1;
////  if(newHeight > newWidth){
////    if(fmod(newHeight,newWidth) > 0){
////      numberArrayImage = newHeight / (newWidth) + 1;
////    }else{
////      numberArrayImage = newHeight / (newWidth);
////    }
////  }
//  UIImage *newImage =imagePrintClient;
//  numberArrayImage = 3;
//  NSLog(@"printImageFromClient URL 2");
//  for (int i=0; i<numberArrayImage; i++) {
//    CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, i * newImage.size.height / numberArrayImage, newImage.size.width, newImage.size.height / numberArrayImage));
//    UIImage *img = [UIImage imageWithCGImage:topImgRef];
//    [images addObject:img];
//    CGImageRelease(topImgRef);
//  }
//  NSLog(@"printImageFromClient URL 3");
//  //  for (int i=0, count = [images count]; i < count; i++) {
//
//  Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
//  [cmd Clear];
//  cmd.encodingType =Encoding_UTF8;
//  NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
//  [cmd Append:headercmd];
//  Printer *currentprinter = _printerManager.CurrentPrinter;
//  BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
//  //                                       bitmapSetting.Alignmode = Align_Right;
//  bitmapSetting.Alignmode = Align_Center;
//  int Size = SizeInput > 0 ? SizeInput : 72;
//  bitmapSetting.limitWidth = Size*8;//ESC
//  NSData *data;
//  NSLog(@"printImageFromClient URL 4");
//  for (int i=0, count = [images count]; i < count; i++) {
//    data = [cmd GetBitMapCmd:bitmapSetting image:[images objectAtIndex:i]];
//    [cmd Append:data];
//    NSLog(@"printImageFromClient URL 5");
//    [cmd Append:[cmd GetLFCmd]];
//
////    if(i==count-1){
////      [cmd Append:[cmd GetAskPrintOkCmd]];
////      [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];//for ESC
////      [cmd Append:[cmd GetPrintEndCmd]];
////      [cmd Append:[cmd GetBeepCmd:1 interval:10]];
////      [cmd Append:[cmd GetPrintEndCmd]];
////    }
//    data = nil;
//  }
//
////  [cmd Append:[cmd GetAskPrintOkCmd]];
//  [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];//for ESC
//  [cmd Append:[cmd GetPrintEndCmd]];
//  [cmd Append:[cmd GetBeepCmd:1 interval:10]];
//  [cmd Append:[cmd GetPrintEndCmd]];
//
////   [cmd Append:[cmd GetLFCRCmd]];
////  [cmd Append:[cmd GetPrintEndCmd:1]];
////  [cmd Append:[cmd GetFeedAndCutPaperCmd:true FeedDistance:10]];
////  [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];//for ESC
////  [cmd Append:[cmd GetBeepCmd:1 interval:10]];
//  if ([_printerManager.CurrentPrinter IsOpen]){
//    NSData *data=[cmd GetCmd];
//    [currentprinter Write:data];
//    NSLog(@"printImageFromClient URL 7");
//  }
//  data = nil;
//  cmd=nil;
//  //  }
//  [_printerManager.CurrentPrinter Close];
 
  images = [@[] mutableCopy];
  CGImageRef tmpImgRef = imagePrintClient.CGImage;
  int numberArrayImage = 3;
  NSLog(@"printImageFromClient URL 2");
  for (int i=0; i<numberArrayImage; i++) {
    CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, i * imagePrintClient.size.height / numberArrayImage, imagePrintClient.size.width, imagePrintClient.size.height / numberArrayImage));
    UIImage *img = [UIImage imageWithCGImage:topImgRef];
    [images addObject:img];
    CGImageRelease(topImgRef);
  }
  NSLog(@"printImageFromClient URL 4");
  NSData *data;
  Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
  [cmd Clear];
  int ilimitwidth = SizeInput > 0 ? SizeInput : 72;;
  Printer *currentprinter = _printerManager.CurrentPrinter;
  BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
  bitmapSetting.Alignmode = Align_Center;
  bitmapSetting.limitWidth = ilimitwidth*8;//ESC

  for (int i=0, count = [images count]; i < count; i++) {
    data = [cmd GetBitMapCmd:bitmapSetting image:[images objectAtIndex:i]];
    [cmd Append:data];
    NSLog(@"printImageFromClient URL 5");
    [cmd Append:[cmd GetLFCmd]];

  
    data = nil;
  }
//  if(i==count-1){
    [cmd Append:[cmd GetAskPrintOkCmd]];
    [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];//for ESC
    [cmd Append:[cmd GetPrintEndCmd]];
    [cmd Append:[cmd GetBeepCmd:1 interval:10]];
    [cmd Append:[cmd GetPrintEndCmd]];
//  }
  if ([_printerManager.CurrentPrinter IsOpen]){
    PrintClose = YES;
    NSData *dataPrint=[cmd GetCmd];
    [currentprinter Write:dataPrint];
    NSLog(@"printImageFromClient URL 7 %@", dataPrint);
    NSLog(@"printImageFromClient isCopies 8 %@", isCopies);
    [[currentprinter PrinterPi] setCallbackwhenSendSuccess:^(NSInteger ipackNo, NSInteger ipackcnt, NSString *message) {
      //      cmd=nil;
      //      [_printerManager.CurrentPrinter Close];
      if ([isCopies isEqualToString:@"true"])
      {
        NSLog(@"printImageFromClient isCopies connect");
      }else {
        NSLog(@"printImageFromClient isCopies disconnect");
        double delayInSeconds = 3;
        dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
        dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
          NSLog(@"printImageFromClient isCopies disconnect close");
          [_printerManager.CurrentPrinter Close];
        });
      }
      //      double delayInSeconds = 2;
      //      dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
      //      dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
      //        [_printerManager.CurrentPrinter Close];
      //      });
    }];
//    [[currentprinter PrinterPi] setCallbackPrintFinsh:^(BOOL isSucc, NSString *message) {
//      [_printerManager.CurrentPrinter Close];
//    }];
  }
  cmd=nil;
}

#pragma handleNotification
- (void)handleNotification:(NSNotification *)notification{
  dispatch_async(dispatch_get_main_queue(),^{
    if([notification.name isEqualToString:(NSString *)PrinterConnectedNotification])
    {
      if (self->isConnectAndPrint) {
        NSLog(@"isConnectAndPrint");
        if (self->PrintImageClient) {
          // [self printClient];
          [self SendSwicthScreen: @"Ok"];
        } else {
          //          [self loadWebview];
        }
      }
    }else if([notification.name isEqualToString:(NSString *)PrinterDisconnectedNotification])
    {
      if (!self->PrintClose && !self->isLocalNetwork) {
        [self SendSwicthScreen: @"Error"];
      }
    } else if (([notification.name isEqualToString:(NSString *)BleDeviceDataChanged]))
    {
      NSLog(@"notification BleDeviceDataChanged");
    }
    
  });
}

+ (id)allocWithZone:(NSZone *)zone {
  static Print *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

-(void)startObserving {
  hasListeners = YES;
}

-(void)stopObserving {
  hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"sendSwicthScreen"];
}
- (void)SendSwicthScreen: (NSString *) info
{
  if (hasListeners) {
    NSString *myString;
    myString = [NSString stringWithFormat:@"%@::%@", IP , info];
    NSLog(@"SendSwicthScreen %@" , myString);
    [self sendEventWithName:@"sendSwicthScreen" body:myString];
  } else {
    
  }
}

@end
