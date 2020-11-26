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
  NSMutableArray *images;
  
  bool isHtml;
  
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

RCT_EXPORT_METHOD(printImageFromClient:(NSString *)param callback:(RCTResponseSenderBlock)callback) {
  NSLog(@"printImageFromClient param %@", param);
  PrintImageClient = YES;
  isConnectAndPrint = YES;
  isHtml = NO;
//  if(imagePrintClient)
    [_printerManager DoConnectwifi:IP Port:9100];
  
//  for (id tempObject in param) {
    NSURL *URL = [RCTConvert NSURL:param];
    NSLog(@"printImageFromClient URL %@", URL);
    NSData *imgData = [[NSData alloc] initWithContentsOfURL:URL];
    
    imagePrintClient = [[UIImage alloc] initWithData:imgData];
    NSLog(@"printImageFromClient imagePrintClient %@", imagePrintClient);
//    [self printClient];
  callback(@[[NSNull null], @"HungOk"]);
//  }
 
}

RCT_EXPORT_METHOD(printImage:(NSString *)param) {
  NSLog(@"printImage param %@", param);
  html = param;
//  html =  @"Hung ok";
  NSLog(@"printImage html %@", html);
  isConnectAndPrint = YES;
  isHtml = YES;
  [_printerManager DoConnectwifi:IP Port:9100];
//  [self loadWebview: html];
  
//  dispatch_async(dispatch_get_main_queue(), ^{
//      [UIApplication.sharedApplication setNetworkActivityIndicatorVisible:YES];
//    [self loadWebview: html];
//  });
  
//  double delayInSeconds1 = 0.5;
//   dispatch_time_t popTime1 = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds1 * NSEC_PER_SEC)); // 1
//   dispatch_after(popTime1, dispatch_get_main_queue(), ^(void){
//     [self loadWebview: html];
//   });
  
  for (int i=0; i<3; i++) {
    double delayInSeconds1 = 0.5;
    dispatch_time_t popTime1 = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds1 * NSEC_PER_SEC)); // 1
    dispatch_after(popTime1, dispatch_get_main_queue(), ^(void){
      [self loadWebview: html];
    });
  }
  
}

//- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
//  [webView evaluateJavaScript:@"Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight)"
//            completionHandler:^(id _Nullable result, NSError * _Nullable error) {
//    if (!error) {
//      CGFloat height = [result floatValue];
//      // do with the height
//      NSLog(@"height=%f",height);
//    }
//  }];
//}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
  NSLog(@"loadWebview done ");
  
  [webView setFrame:CGRectMake(0, 0, webView.scrollView.contentSize.width, webView.scrollView.contentSize.height )];
  
  WKSnapshotConfiguration *wkSnapshotConfig = [WKSnapshotConfiguration new];
  wkSnapshotConfig.snapshotWidth = [NSNumber numberWithInt:webView.scrollView.contentSize.width];
  
  [webView takeSnapshotWithConfiguration:wkSnapshotConfig completionHandler:^(UIImage * _Nullable snapshotImage, NSError * _Nullable error) {
    
    NSLog(@"snapshotImage=%@",snapshotImage);
    
    imagePrint = snapshotImage;
    //
    float oldWidth = imagePrint.size.width;
    float oldHeight = imagePrint.size.height;
    NSLog(@"oldWidth=%f",oldWidth);
    NSLog(@"oldWidth=%f",oldWidth);
    float i_width = 1000;
    //        float oldHeight = 1200;
    
    float scaleFactor = i_width / oldWidth;
    float newHeight = oldHeight * scaleFactor;
    float newWidth = oldWidth * scaleFactor;
    
    
    NSLog(@"newWidth=%f",newWidth);
    NSLog(@"newHeight=%f",newHeight);
    UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
    [imagePrint drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    imagePrint = newImage;
    
    //
    
    CGImageRef tmpImgRef = imagePrint.CGImage;
    CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, 0, imagePrint.size.width, imagePrint.size.height / 3.0));
    imagePrint1 = [UIImage imageWithCGImage:topImgRef];
    CGImageRelease(topImgRef);
    
    CGImageRef bottomImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, imagePrint.size.height / 3.0,  imagePrint.size.width, imagePrint.size.height / 3.0));
    imagePrint2 = [UIImage imageWithCGImage:bottomImgRef];
    CGImageRelease(bottomImgRef);
    
    CGImageRef bottomImgRef3 = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, imagePrint.size.height * 2 / 3.0,  imagePrint.size.width, imagePrint.size.height / 3.0));
    imagePrint3 = [UIImage imageWithCGImage:bottomImgRef3];
    CGImageRelease(bottomImgRef3);
    
    //                                 self.imageView.image = imagePrint;
    NSLog(@"imagePrint =%@",imagePrint);
    NSLog(@"imagePrint1 =%@",imagePrint1);
    NSLog(@"imagePrint2 =%@",imagePrint2);
    NSLog(@"imagePrint3 =%@",imagePrint3);
    
    UIGraphicsEndImageContext();
    
//    for (int i=0; i<3; i++) {
//      Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
//      [cmd Clear];
//      cmd.encodingType =Encoding_UTF8;
//      NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
//      [cmd Append:headercmd];
//
//      NSLog(@"imageFromWebview 4");
//      Printer *currentprinter = _printerManager.CurrentPrinter;
//      BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
//      bitmapSetting.Alignmode = Align_Left;
//      bitmapSetting.Alignmode = Align_Center;
//      bitmapSetting.limitWidth = 72*8;
//      NSData *data;
//      if(i == 0){
//        data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint1];
//      }else if(i == 1){
//        data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint2];
//      }else{
//        data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint3];
//      }
//      [cmd Append:data];
//      NSLog(@"imageFromWebview 5.2");
//      [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
//      NSLog(@"imageFromWebview 6");
//      if ([_printerManager.CurrentPrinter IsOpen]){
//        NSData *data=[cmd GetCmd];
//        [currentprinter Write:data];
//      }
//      data = nil;
//      cmd=nil;
//
//    }
    [_printerManager.CurrentPrinter Close];
  }];
  
}

- (void)loadWebview : (NSString *) infoHtml{
  NSLog(@"loadWebview start");
  CGRect screen = [[UIScreen mainScreen] bounds];
  CGFloat w = CGRectGetWidth(screen);
  CGFloat h = CGRectGetHeight(screen);
  CGRect frame = CGRectMake(0,0,w/2,h/2);
  //    webView12.frame = CGRec(x: self.view.bounds.width, y: 0, width: self.view.bounds.width, height: webView.scrollView.contentSize.height);
  
  WKWebViewConfiguration *theConfiguration = [[WKWebViewConfiguration alloc] init];
  webView =[[WKWebView alloc] initWithFrame:frame
                              configuration:theConfiguration];
  webView.navigationDelegate = self;
  //            webView12.UIDelegate = self;
  //            NSString *embedHTML = @"<div>ABC Hùng thôi nhé ABC Hùng thôi nhé ABC Hùng thôi nhé ABC Hùng thôi nhé  </div>";
  NSString *embedHTML = infoHtml;
  
  
  webView.userInteractionEnabled = NO;
  webView.opaque = YES;
  webView.backgroundColor = [UIColor whiteColor];
  //                [webView12 setScalesPageToFit:YES];
  webView.contentMode = UIViewContentModeScaleToFill;
  [webView snapshotViewAfterScreenUpdates:YES];
  [webView loadHTMLString: embedHTML baseURL: nil];
  
//  double delayInSeconds1 = 1.5;
//  dispatch_time_t popTime1 = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds1 * NSEC_PER_SEC)); // 1
//  dispatch_after(popTime1, dispatch_get_main_queue(), ^(void){
    
//    [self->webView setFrame:CGRectMake(0, 0, webView.scrollView.contentSize.width, webView.scrollView.contentSize.height )];
//
//    WKSnapshotConfiguration *wkSnapshotConfig = [WKSnapshotConfiguration new];
//    wkSnapshotConfig.snapshotWidth = [NSNumber numberWithInt:webView.scrollView.contentSize.width];
//
//    [webView takeSnapshotWithConfiguration:wkSnapshotConfig completionHandler:^(UIImage * _Nullable snapshotImage, NSError * _Nullable error) {
//
//      NSLog(@"snapshotImage=%@",snapshotImage);
//
//      imagePrint = snapshotImage;
//      //
//      float oldWidth = imagePrint.size.width;
//      float oldHeight = imagePrint.size.height;
//
//      float i_width = 1000;
//      //        float oldHeight = 1200;
//
//      float scaleFactor = i_width / oldWidth;
//      float newHeight = oldHeight * scaleFactor;
//      float newWidth = oldWidth * scaleFactor;
//
//
//      NSLog(@"newWidth=%f",newWidth);
//      NSLog(@"newHeight=%f",newHeight);
//      UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
//      [imagePrint drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
//      UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
//      imagePrint = newImage;
//
//      //
//
//      CGImageRef tmpImgRef = imagePrint.CGImage;
//      CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, 0, imagePrint.size.width, imagePrint.size.height / 3.0));
//      imagePrint1 = [UIImage imageWithCGImage:topImgRef];
//      CGImageRelease(topImgRef);
//
//      CGImageRef bottomImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, imagePrint.size.height / 3.0,  imagePrint.size.width, imagePrint.size.height / 3.0));
//      imagePrint2 = [UIImage imageWithCGImage:bottomImgRef];
//      CGImageRelease(bottomImgRef);
//
//      CGImageRef bottomImgRef3 = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, imagePrint.size.height * 2 / 3.0,  imagePrint.size.width, imagePrint.size.height / 3.0));
//      imagePrint3 = [UIImage imageWithCGImage:bottomImgRef3];
//      CGImageRelease(bottomImgRef3);
//
//      //                                 self.imageView.image = imagePrint;
//      NSLog(@"imagePrint =%@",imagePrint);
//      NSLog(@"imagePrint1 =%@",imagePrint1);
//      NSLog(@"imagePrint2 =%@",imagePrint2);
//      NSLog(@"imagePrint3 =%@",imagePrint3);
//
//      UIGraphicsEndImageContext();
//
//      for (int i=0; i<3; i++) {
//        Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
//        [cmd Clear];
//        cmd.encodingType =Encoding_UTF8;
//        NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
//        [cmd Append:headercmd];
//
//        NSLog(@"imageFromWebview 4");
//        Printer *currentprinter = _printerManager.CurrentPrinter;
//        BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
//        bitmapSetting.Alignmode = Align_Left;
//        bitmapSetting.Alignmode = Align_Center;
//        bitmapSetting.limitWidth = 72*8;
//        NSData *data;
//        if(i == 0){
//          data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint1];
//        }else if(i == 1){
//          data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint2];
//        }else{
//          data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint3];
//        }
//        [cmd Append:data];
//        NSLog(@"imageFromWebview 5.2");
//        [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
//        NSLog(@"imageFromWebview 6");
//        if ([_printerManager.CurrentPrinter IsOpen]){
//          NSData *data=[cmd GetCmd];
//          [currentprinter Write:data];
//        }
//        data = nil;
//        cmd=nil;
//
//      }
//      [_printerManager.CurrentPrinter Close];
//    }];
//  });
  
//  //  imageArray = [[NSMutableArray alloc] init];
//  imageArray  = [NSMutableArray new];
//  CGRect frame = CGRectMake(0,0,200,600);
//  webView =[[WKWebView alloc] initWithFrame:frame];
//  webView.navigationDelegate = self;
//  webView.userInteractionEnabled = NO;
//  webView.opaque = NO;
//  webView.backgroundColor = [UIColor whiteColor];
//  [webView loadHTMLString: html baseURL: nil];
//
//  double delayInSeconds = 1;
//  dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC)); // 1
//  dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
//    CGRect originalFrame = webView.frame;
//
//    int webViewHeight= webView.scrollView.contentSize.height;
//    int webViewWidth = webView.scrollView.contentSize.width;
//    NSLog(@"webView.scrollView.contentSize.width =%f",webView.scrollView.contentSize.width);
//    NSLog(@"webView.scrollView.contentSize.height =%f",webView.scrollView.contentSize.height);
//    NSLog(@"webViewWidth=%d",webViewWidth);
//    NSLog(@"webViewHeight=%d",webViewHeight);
//    //set the webview's frames to match the size of the page
//    [self->webView setFrame:CGRectMake(0, 0, webViewWidth, webViewHeight)];
//
//    //make the snapshot
//    UIGraphicsBeginImageContextWithOptions(webView.frame.size, false, 0.0);
//    [webView.layer renderInContext:UIGraphicsGetCurrentContext()];
//    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
//    UIGraphicsEndImageContext();
//
//    //set the webview's frame to the original size
//    [webView setFrame:originalFrame];
//
//    imagePrint = image;
////    UIImage *newImage =image;
//    NSLog(@".width=%d",image.size.width);
//    NSLog(@".height=%d",image.size.height);
//
//    float i_width = 1000;
//    float oldWidth = imagePrint.size.width;
//    float oldHeight = imagePrint.size.height;
//
//    float scaleFactor = i_width / oldWidth;
//    NSLog(@"i_width=%f",i_width);
//    NSLog(@"oldWidth=%f",oldWidth);
//    NSLog(@"scaleFactor=%f",scaleFactor);
//
//    float newHeight = oldHeight * scaleFactor;
//    float newWidth = oldWidth * scaleFactor;
//
//    NSLog(@"newWidth=%f",newWidth);
//    NSLog(@"newHeight=%f",newHeight);
//    UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
//    [imagePrint drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
//    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
//    imagePrint = newImage;
//
////    NSString *base64String = @"data:image/png;base64,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ldKTnsc6R4AAgeoFQok7JNUvvvhiZdF9Fr4p2a/v5o/u7NdL992xt956a/uZe1eaD5/Pd7v37trrCT2c4+GHH1715d57720XAV0CX9+RH93Nj5rQldKrvzcAECBAICuBrvz9/vvvt2Xv9e9vueWWy15ai03oAWH9BbawSAife58/f779unDhQnPp0qV2Jx9euLvnnntat3D+c+fOrcro69+Hz+wnTehK6VnNXZ0lQIAAgRMEulL6888/f+jFs5iSezh190b6pgTdXTpsgMPn50888UTz2GOPNXfccUe7cw9f3Vvr3aKg+9z8t99+W72UN1rJXSnd/UCAAAECpQoctwvf9FLc+tvxR0vw4TPup59+uv0M/dFHH73spbv1kvtNN9202r0H1y65//LLL6uX5EJCX39hbqeX4pTSS522xkWAAIG6BY6+WNYl4e730I/7tbWwQ15/6zworr+Bvp6sr7rqqkM/68SPfobeLRhuu+225r777mt+/fXXdkd+3XXXtZ/BhzfmX3zxxfZX1Xr92ppSet2T3OgJECBQi8DR/1hm/ffCu7J59x/LHP3Z+kts3ct0XaIOn8l35ffQLnz+3b3gFs676aW4o/+xTHhj/rXXXmsuXrzY7uBDkg8fBXz33Xfb/2MZpfRapq9xEiBAgECOAtvydPuW+9mzZy+F7B+286dPn26/Nv0yfI6D12cCBAgQIFCiQPg4POTu8BX+HnL3fwGAyHYzePzAEQAAAABJRU5ErkJggg==";
////
////       NSURL *url = [NSURL URLWithString:base64String];
////       NSData *imageData = [NSData dataWithContentsOfURL:url];
////    newImage = [UIImage imageWithData:imageData];
////    imagePrint = newImage;
//
//    CGImageRef tmpImgRef = newImage.CGImage;
//    NSLog(@"newHeight abc");
//    int numberArrayImage = 1;
////    if(newHeight > newWidth){
////      if(fmod(newHeight,newWidth) > 0){
////        numberArrayImage = newHeight / newWidth + 1;
////      }else{
////        numberArrayImage = newHeight / newWidth;
////      }
////    }
//
//    for (int i=0; i<numberArrayImage; i++) {
//      CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, i * newImage.size.height / numberArrayImage, newImage.size.width, newImage.size.height / numberArrayImage));
//      UIImage *img = [UIImage imageWithCGImage:topImgRef];
//      [self->imageArray addObject:img];
//      CGImageRelease(topImgRef);
//    }
//
//    for (int i=0, count = [imageArray count]; i < count; i++) {
//      Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
//      [cmd Clear];
//      cmd.encodingType =Encoding_UTF8;
//      NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
//      [cmd Append:headercmd];
//
//      Printer *currentprinter = _printerManager.CurrentPrinter;
//      BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
//      //                                       bitmapSetting.Alignmode = Align_Right;
//      bitmapSetting.Alignmode = Align_Center;
//      bitmapSetting.limitWidth = 60*9;//ESC
//
//      NSData *data;
//      data = [cmd GetBitMapCmd:bitmapSetting image:[imageArray objectAtIndex:i]];
//      [cmd Append:data];
//      [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
//      if ([_printerManager.CurrentPrinter IsOpen]){
//        NSData *data=[cmd GetCmd];
//        [currentprinter Write:data];
//      }
//
//      data = nil;
//      cmd=nil;
//    }
//    imageArray = @[];
//  });
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
//      if (self->isConnectAndPrint) {
        NSLog(@"isConnectAndPrint");
//      [self loadWebview: html];
//      if(isHtml){
//        [self loadWebview];
//      }else {
//        [self printClient];
//      }
//        if (self->PrintImageClient) {
//          [self printClient];
//          [self SendSwicthScreen: @"Ok"];
//        } else {
//          //          [self loadWebview];
//        }
//      }
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
