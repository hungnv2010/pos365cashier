//
//  PrinterManager.h
//  PrinterExample
//
//  Created by King on 12/12/2017.
//  Copyright © 2017 Printer. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Printer.h"
#import "WIFIFactory.h"
#import "Header.h"
#import "Cmd.h"
#import "SafeMutableArray.h"
#import "RTDeviceinfo.h";
#import "PrinterInterface.h"
#import "EnumTypeDef.h"


extern const NSString *STATUS_MOVEMENT_ERROR;
extern const NSString *STATUS_PAPER_JAMMED_ERROR;
extern const NSString *STATUS_NO_PAPER_ERROR;
extern const NSString *STATUS_RIBBON_RUNS_OUT_ERROR;
extern const NSString *STATUS_PRINTER_PAUSE;
extern const NSString *STATUS_PRINTER_BUSY;
extern const NSString *STATUS_PRINTER_LID_OPEN;
extern const NSString *STATUS_OVERHEATED_ERROR;
extern const NSString *STATUS_READYPRINT;



@protocol SelectDelegate <NSObject>
-(void)selectDeviceInfo:(RTDeviceinfo *)device;
-(void)selectPrinterInterface:(PrinterInterface *)printerpi;
-(void)selectCodepage:(NSString *)codeName codevalue:(NSString*)codevalue;
-(void)selectNetworkPrinterInfo:(NetPrinterInfo *)device;
@end





@interface PrinterManager : NSObject

@property (strong, nonatomic) Printer *CurrentPrinter;
//@property(nonatomic,strong)    PrinterInterface *printerInterface;
@property(nonatomic)  PrinterCmdType CurrentPrinterCmdType;//当前的指令类型
@property(nonatomic)  PrinterPortType CurrentPrinterPortType;//当前的端口类型
@property(nonatomic) SafeMutableArray *PrinterList;
@property(nonatomic,strong) NSArray *CodePagelist;
@property(nonatomic) int MTULength;
@property(nonatomic) int SendDelayMS;
@property(nonatomic) int icopys;




+ (PrinterManager *)sharedInstance;
-(void)DoConnectwifi:(NSString *)Address Port:(NSInteger)Port;
-(void)DoConnectBle:(NSString *)Address;
-(void)DoConnectMfi:(NSString *)Address;
- (void)AddConnectObserver:(id)observer selector:(SEL)aSelector;
-(Cmd *)CreateCmdClass:(PrinterCmdType)PrinterCmdType;
-(Printer *)CreatePrinterClass:(PrinterCmdType)PrinterCmdType;
-(void) AutoStartConnectBleNoScan:(NSString *) uuid;
-(NSData *) GetHeaderCmd:(Cmd *)cmd cmdtype:(PrinterCmdType)cmdtype;
-(void)SetBluetoothSize:(int)iMTULength iSendDelayMS:(int)iSendDelayMS;

@end
