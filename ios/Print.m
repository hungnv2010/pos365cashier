//
//  Print.m
//  Pos365Order
//
//  Created by HungNV on 5/18/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Print.h"
#import "PrinterManager.h"
#import <WebKit/WebKit.h>
#import "TSCCmd.h"

@interface Print ()
{
  PrinterManager * _printerManager;
  UIImage *imagePrint;
  UIImage *imagePrintClient;
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
  NSMutableArray *images;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(registerPrint:(NSString *)param) {
  NSLog(@"registerPrint param %@", param);
  NSArray *arrayOfComponents = [param componentsSeparatedByString:@"_"];
  IP = arrayOfComponents[0];
  SizeInput = [arrayOfComponents[1] integerValue];
  NSLog(@"registerPrint IP %@", IP);
  NSLog(@"registerPrint SizeInput %ld", (long)SizeInput);
  isConnectAndPrint = NO;
  _printerManager = [PrinterManager sharedInstance];
  [_printerManager AddConnectObserver:self selector:@selector(handleNotification:)];//Add
}

RCT_EXPORT_METHOD(printImageFromClient:(NSArray *)param) {
  NSLog(@"printImageFromClient param %@", param);
  PrintImageClient = YES;
  isConnectAndPrint = YES;
  for (id tempObject in param) {
    NSURL *URL = [RCTConvert NSURL:tempObject];
    NSLog(@"printImageFromClient URL %@", URL);
    NSData *imgData = [[NSData alloc] initWithContentsOfURL:URL];
    
    imagePrintClient = [[UIImage alloc] initWithData:imgData];
    NSLog(@"printImageFromClient imagePrintClient %@", imagePrintClient);
    [self printClient];
    
  }
  if(imagePrintClient)
    [_printerManager DoConnectwifi:IP Port:9100];
  
}

RCT_EXPORT_METHOD(printImage:(NSString *)param) {
  NSLog(@"printImage param %@", param);
  html = param;
  isConnectAndPrint = YES;
  [_printerManager DoConnectwifi:IP Port:9100];
  
}

- (void) printClient {
  images = [@[] mutableCopy];
  
  float i_width = 1000;
  float oldWidth = imagePrintClient.size.width;
  float oldHeight = imagePrintClient.size.height;
  
  float scaleFactor = i_width / oldWidth;
  float newHeight = oldHeight * scaleFactor;
  float newWidth = oldWidth * scaleFactor;
  UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
  [imagePrintClient drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
  UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
  imagePrintClient = newImage;
  
  CGImageRef tmpImgRef = newImage.CGImage;
  int numberArrayImage = 1;
  if(newHeight > newWidth){
    if(fmod(newHeight,newWidth) > 0){
      numberArrayImage = newHeight / newWidth + 1;
    }else{
      numberArrayImage = newHeight / newWidth;
    }
  }
  
  for (int i=0; i<numberArrayImage; i++) {
    CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, i * newImage.size.height / numberArrayImage, newImage.size.width, newImage.size.height / numberArrayImage));
    UIImage *img = [UIImage imageWithCGImage:topImgRef];
    [images addObject:img];
    CGImageRelease(topImgRef);
  }
  
  //  for (int i=0, count = [images count]; i < count; i++) {
  
  Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
  [cmd Clear];
  cmd.encodingType =Encoding_UTF8;
  NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
  [cmd Append:headercmd];
  Printer *currentprinter = _printerManager.CurrentPrinter;
  BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
  //                                       bitmapSetting.Alignmode = Align_Right;
  bitmapSetting.Alignmode = Align_Center;
  int Size = SizeInput > 0 ? SizeInput : 72;
  bitmapSetting.limitWidth = Size*8;//ESC
  NSData *data;
  
  for (int i=0, count = [images count]; i < count; i++) {
    data = [cmd GetBitMapCmd:bitmapSetting image:[images objectAtIndex:i]];
    [cmd Append:data];
  }
  [cmd Append:[cmd GetLFCRCmd]];
  //[cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
  //[cmd Append:[cmd GetFeedAndCutPaperCmd:false FeedDistance:0]];
  [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];//for ESC
  [cmd Append:[cmd GetBeepCmd:1 interval:10]];
  //    [cmd Append:[cmd GetOpenDrawerCmd:0 startTime:5 endTime:0]];
  if ([_printerManager.CurrentPrinter IsOpen]){
    NSData *data=[cmd GetCmd];
    [currentprinter Write:data];
  }
  data = nil;
  cmd=nil;
  //  }
  [_printerManager.CurrentPrinter Close];
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
      [self SendSwicthScreen: @"Error"];
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
    [self sendEventWithName:@"sendSwicthScreen" body:myString];
  } else {
    
  }
}

@end
