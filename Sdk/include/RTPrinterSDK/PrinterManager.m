//
//  PrinterManager.m
//  PrinterExample
//
//  Created by King on 12/12/2017.
//  Copyright © 2017 Printer. All rights reserved.
//

#import "PrinterManager.h"

#import "WIFIFactory.h"
#import "PinPrinterFactory.h"
#import "ESCFactory.h"
#import "ThermalPrinter.h"
#import "ThermalPrinterFactory.h"
#import "LabelPrinterFactory.h"
#import "PinCmdFactory.h"
#import "RTBlueToothPI.h"
#import "BlueToothFactory.h"
#import "RTBlueToothPI.h"
#import "TSCFactory.h"
#import "CPCLFactory.h"
#import "LabelCommonSetting.h"
#import "ZPLFactory.h"
#import "PlistUtils.h"


const NSString * STATUS_MOVEMENT_ERROR = @"Printer movement error";//机芯错误
const NSString * STATUS_PAPER_JAMMED_ERROR = @"Paper jammed error";//卡纸
const NSString * STATUS_NO_PAPER_ERROR = @"No Paper";//缺纸
const NSString * STATUS_RIBBON_RUNS_OUT_ERROR = @"The ribbon runs out";//碳带用尽
const NSString * STATUS_PRINTER_PAUSE = @"Printer Pause";//打印机暂停，空闲
const NSString * STATUS_PRINTER_BUSY = @"Printer Busy";//正在打印
const NSString * STATUS_PRINTER_LID_OPEN = @"The printer's lid is open";//开盖状态
const NSString * STATUS_OVERHEATED_ERROR = @"The printer is overheated ";//头片过热
const NSString * STATUS_READYPRINT = @"Ready to print";//打印就绪



@implementation PrinterManager


//-(id) init{
//
//    if (self=[super init]) {
//        _MTULength = 100;
//        _SendDelayMS = 20;
//    }
//    return self;
//
//}
-(void)loadConfigParam{
    self.MTULength = (int)[PlistUtils loadIntConfig:@"MTULength" defaultValue:100];
    self.SendDelayMS = (int)[PlistUtils loadIntConfig:@"SendDelayMS" defaultValue:20];
    self.CurrentPrinter.blewritetype = (BleWriteType)[PlistUtils loadIntConfig:@"BleWritetype" defaultValue:1];//bleWriteWithoutResponse;//bleWriteWithResponse;
    self.CurrentPrinterPortType = (PrinterPortType)[PlistUtils loadIntConfig:@"PrinterPortType" defaultValue:PrinterPortBle];
    self.CurrentPrinterCmdType = (PrinterCmdType)[PlistUtils loadIntConfig:@"PrinterCmdType" defaultValue:PrinterCmdESC];
}
+ (PrinterManager *)sharedInstance{
    static PrinterManager *_sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[PrinterManager alloc] init];
        _sharedInstance.CurrentPrinter = [_sharedInstance CreatePrinterClass:PrinterCmdESC];
        [_sharedInstance loadConfigParam];
        _sharedInstance.PrinterList = [SafeMutableArray arrayWithCapacity:4];
        [_sharedInstance loadCodepagelist];
        _sharedInstance.icopys = 0;
    });
    
    return _sharedInstance;
}

-(void)loadCodepagelist{
    NSString *path= [[NSBundle mainBundle] pathForResource:@"codepage" ofType:@"plist"];
//    _CodePagelist =[[NSDictionary alloc] initWithContentsOfFile:path];
    NSArray *tmpAry =  [NSArray arrayWithContentsOfFile:path];
    NSMutableArray *tmpKeyName = [[NSMutableArray alloc]initWithCapacity:53];
    NSMutableArray *tmpKeyValue = [[NSMutableArray alloc]initWithCapacity:53];
  
    NSRange range1,range2,range3;
    for(NSString *str in tmpAry){
         range1 = [str rangeOfString:@"<"];
         range2 = [str rangeOfString:@">"];
        if (range1.length==0 || range2.length==0)
            continue;
        [tmpKeyName addObject: [str substringToIndex:range1.location]];
        range3 = NSMakeRange(range1.location+1, range2.location-range1.location-1);
        [tmpKeyValue addObject: [str substringWithRange:range3]];
//        NSLog(@"Keyname=%@ keyvalue=%@",tmpKeyName,tmpKeyValue);
    }
    _CodePagelist = [[NSArray alloc] initWithObjects:tmpKeyName,tmpKeyValue,nil];
  
//  NSLog(@"codepagelist.count=%d",_CodePagelist.count);
//    for (NSArray *ary in _CodePagelist) {
//        for (NSString *s in ary) {
//
//        NSLog(@"s=%@",s);
//        }
//
//    }
//

    
}
-(Cmd *)CreateCmdClass:(PrinterCmdType)PrinterCmdType{
    Cmd *cmd;
    switch (PrinterCmdType) {
        case PrinterCmdESC:
            cmd =  [ESCFactory Create];
            break;
        case PrinterCmdTSC:
            cmd=  [TSCFactory Create];
            break;
        case PrinterCmdCPCL:
            cmd = [CPCLFactory Create];
            break;
        case PrinterCmdPIN:
            cmd = [PinCmdFactory Create];
            break;
        case PrinterCmdZPL:
            cmd = [ZPLFactory Create];
            break;

        default:
            cmd=nil;
    }
    return cmd;
}


-(Printer *)CreatePrinterClass:(PrinterCmdType)PrinterCmdType{
    Printer * _printer;
    switch (PrinterCmdType) {
        case PrinterCmdESC:
            _printer =  [ThermalPrinterFactory Create];
            break;
        case PrinterCmdTSC:
        case PrinterCmdCPCL:
            _printer =  [LabelPrinterFactory Create];
            break;
        case PrinterCmdPIN:
            _printer = [PinPrinterFactory Create];
            break;
        default:
            _printer=nil;
    }
    return _printer;
}


-(void)DoConnectwifi:(NSString *)Address Port:(NSInteger)Port {
    PrinterInterface *printerInter = [WIFIFactory Create];
    printerInter.Address = Address;
    printerInter.Port = Port;
    printerInter.printerCmdtype = self.CurrentPrinterCmdType;
    [_CurrentPrinter setPrinterPi:printerInter];
    [_CurrentPrinter Open];
}




-(void)DoConnectBle:(NSString *)Address {
    RTBlueToothPI *blueToothPI =  [BlueToothFactory Create:BlueToothKind_Ble];
    blueToothPI.MTULength= self.MTULength;
    blueToothPI.SendDelayMS = self.SendDelayMS;
    blueToothPI.Address = Address;
    blueToothPI.printerCmdtype = self.CurrentPrinterCmdType;
    [_CurrentPrinter setPrinterPi:blueToothPI];
    [_CurrentPrinter Open];
}

-(void)DoConnectMfi:(NSString *)Address {
    RTBlueToothPI *blueToothPI =  [BlueToothFactory Create:BlueToothKind_Classic];
    blueToothPI.MTULength= 1024*1024;
    blueToothPI.SendDelayMS = 10;
    blueToothPI.Address = Address;
    blueToothPI.printerCmdtype = self.CurrentPrinterCmdType;
    [_CurrentPrinter setPrinterPi:blueToothPI];
    [_CurrentPrinter Open];
}

- (void)AddConnectObserver:(id)observer selector:(SEL)aSelector{
    [[NSNotificationCenter defaultCenter] addObserver:observer selector:aSelector name:(NSString *)PrinterConnectedNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:observer selector:aSelector name:(NSString *)PrinterDisconnectedNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:observer selector:aSelector name:(NSString *)BleDeviceDataChanged object:nil];

}


/*
-(void)reconnectble:(NSString *) uuid{
    RTBlueToothPI * _blueToothPI = (RTBlueToothPI *)_printerInterface;
    [_blueToothPI connectNoSCanByUUID:uuid];
    
}
-(void) AutoStartConnectBleNoScan:(NSString *) uuid{//conncet ble not no Scan
    _printerInterface  = [BlueToothFactory Create:BlueToothKind_Ble];
    [_CurrentPrinter setPrinterPi:_printerInterface];
    [self performSelector:@selector(reconnectble:) withObject:uuid afterDelay:3.0];
}
 */

-(NSData *) GetHeaderCmd:(Cmd *)cmd cmdtype:(PrinterCmdType)cmdtype{
    
    if (cmdtype==PrinterCmdTSC || cmdtype==PrinterCmdCPCL ||  cmdtype==PrinterCmdZPL){
        LabelCommonSetting *lblcommSetting = [LabelCommonSetting new];
        lblcommSetting.labelWidth = 80;
        lblcommSetting.labelHeight = 40;
        lblcommSetting.labelgap = 3;//3 for Tsc,cpcl
        lblcommSetting.labelDriection = Direction_Forward;
        lblcommSetting.Density = 6;
        lblcommSetting.printCopies = 1; //for cpcl
        self.CurrentPrinter.CommonSetts = lblcommSetting;
        return [cmd GetHeaderCmd:lblcommSetting];
    } else 
    {
        return [cmd GetHeaderCmd];
    }
}
-(void)SetBluetoothSize:(int)iMTULength iSendDelayMS:(int)iSendDelayMS{
    self.MTULength = iMTULength;
    self.SendDelayMS = iSendDelayMS;
    if (self.CurrentPrinter && self.CurrentPrinter.PrinterPi)
    {
        RTBlueToothPI *mblepi = (RTBlueToothPI*) self.CurrentPrinter.PrinterPi;
        mblepi.MTULength = iMTULength;
        mblepi.SendDelayMS = iSendDelayMS;
    }
}


@end
