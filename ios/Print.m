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
  //  imageArray = [[NSMutableArray alloc] init];
  IP = arrayOfComponents[0];
  SizeInput = [arrayOfComponents[1] integerValue];
  if(SizeInput)
    NSLog(@"registerPrint IP %@", IP);
  NSLog(@"registerPrint SizeInput %d", SizeInput);
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

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
  [webView evaluateJavaScript:@"Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight)"
            completionHandler:^(id _Nullable result, NSError * _Nullable error) {
    if (!error) {
      CGFloat height = [result floatValue];
      // do with the height
      NSLog(@"height=%f",height);
    }
  }];
}

- (void)loadWebview{
  NSLog(@"loadWebview ");
  //  imageArray = [[NSMutableArray alloc] init];
  imageArray  = [NSMutableArray new];
  CGRect frame = CGRectMake(0,0,200,600);
  webView =[[WKWebView alloc] initWithFrame:frame];
  webView.navigationDelegate = self;
  webView.userInteractionEnabled = NO;
  webView.opaque = NO;
  webView.backgroundColor = [UIColor whiteColor];
  [webView loadHTMLString: html baseURL: nil];
  
  double delayInSeconds = 1;
  dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC)); // 1
  dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
    CGRect originalFrame = webView.frame;
    //    __block float webViewWidth = 0 ;
    //    __block float webViewHeight = 0 ;
    //    [webView evaluateJavaScript:@"Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight)"
    //              completionHandler:^(id _Nullable result, NSError * _Nullable error) {
    //      if (!error) {
    //        webViewHeight = [result floatValue];
    //        // do with the height
    //        NSLog(@"height=%f",webViewHeight);
    //      }
    //    }];
    //
    //    [webView evaluateJavaScript:@"Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth)"
    //              completionHandler:^(id _Nullable result, NSError * _Nullable error) {
    //      if (!error) {
    //        webViewWidth = [result floatValue];
    //        NSLog(@"width=%f", webViewWidth);
    //      }
    //    }];
    
    //get the width and height of webpage using js (you might need to use another call, this doesn't work always)
    //    int webViewHeight = [[self->webView stringByEvaluatingJavaScriptFromString:@"document.body.scrollHeight;"] integerValue];
    //    int k = [webView string]
    //    int webViewWidth = [[webView stringByEvaluatingJavaScriptFromString:@"document.body.scrollWidth;"] integerValue];
    //
    int webViewHeight= webView.scrollView.contentSize.height;
    int webViewWidth = webView.scrollView.contentSize.width;
    NSLog(@"webView.scrollView.contentSize.width =%f",webView.scrollView.contentSize.width);
    NSLog(@"webView.scrollView.contentSize.height =%f",webView.scrollView.contentSize.height);
    NSLog(@"webViewWidth=%d",webViewWidth);
    NSLog(@"webViewHeight=%d",webViewHeight);
    //set the webview's frames to match the size of the page
    [self->webView setFrame:CGRectMake(0, 0, webViewWidth, webViewHeight)];
    
    //make the snapshot
    UIGraphicsBeginImageContextWithOptions(webView.frame.size, false, 0.0);
    [webView.layer renderInContext:UIGraphicsGetCurrentContext()];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    //set the webview's frame to the original size
    [webView setFrame:originalFrame];
    
    imagePrint = image;
    NSLog(@".width=%d",image.size.width);
    NSLog(@".height=%d",image.size.height);
    
    float i_width = 1000;
    float oldWidth = imagePrint.size.width;
    float oldHeight = imagePrint.size.height;
    
    float scaleFactor = i_width / oldWidth;
    NSLog(@"i_width=%f",i_width);
    NSLog(@"oldWidth=%f",oldWidth);
    NSLog(@"scaleFactor=%f",scaleFactor);
    
    float newHeight = oldHeight * scaleFactor;
    float newWidth = oldWidth * scaleFactor;
    
    NSLog(@"newWidth=%f",newWidth);
    NSLog(@"newHeight=%f",newHeight);
    UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
    [imagePrint drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    imagePrint = newImage;
    
    CGImageRef tmpImgRef = newImage.CGImage;
    NSLog(@"newHeight abc");
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
      [self->imageArray addObject:img];
      CGImageRelease(topImgRef);
    }
    
    for (int i=0, count = [imageArray count]; i < count; i++) {
      Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
      [cmd Clear];
      cmd.encodingType =Encoding_UTF8;
      NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
      [cmd Append:headercmd];
      
      Printer *currentprinter = _printerManager.CurrentPrinter;
      BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
      //                                       bitmapSetting.Alignmode = Align_Right;
      bitmapSetting.Alignmode = Align_Center;
      bitmapSetting.limitWidth = 60*9;//ESC
      
      NSData *data;
      data = [cmd GetBitMapCmd:bitmapSetting image:[imageArray objectAtIndex:i]];
      [cmd Append:data];
      [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
      if ([_printerManager.CurrentPrinter IsOpen]){
        NSData *data=[cmd GetCmd];
        [currentprinter Write:data];
      }
      
      data = nil;
      cmd=nil;
    }
    imageArray = @[];
  });
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
  
  for (int i=0, count = [images count]; i < count; i++) {
    
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
    data = [cmd GetBitMapCmd:bitmapSetting image:[images objectAtIndex:i]];
    [cmd Append:data];
    [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
    if ([_printerManager.CurrentPrinter IsOpen]){
      NSData *data=[cmd GetCmd];
      [currentprinter Write:data];
    }
    data = nil;
    cmd=nil;
  }
  [_printerManager.CurrentPrinter Close];
}

#pragma handleNotification
- (void)handleNotification:(NSNotification *)notification{
  dispatch_async(dispatch_get_main_queue(),^{
    NSLog(@"handleNotification");
    if([notification.name isEqualToString:(NSString *)PrinterConnectedNotification])
    {
      NSLog(@"notification PrinterConnectedNotification");
      if (isConnectAndPrint) {
        NSLog(@"isConnectAndPrint");
        if (PrintImageClient) {
          [self printClient];
          [self SendSwicthScreen: @"Ok"];
        } else {
          [self loadWebview];
        }
      }
    }else if([notification.name isEqualToString:(NSString *)PrinterDisconnectedNotification])
    {
      NSLog(@"notification PrinterDisconnectedNotification");
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

// Will be called when this module's first listener is added.
-(void)startObserving {
  hasListeners = YES;
  // Set up any upstream listeners or background tasks as necessary
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
  hasListeners = NO;
  // Remove upstream listeners, stop unnecessary background tasks
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
