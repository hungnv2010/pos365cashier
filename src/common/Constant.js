export const Constant = {
    HOTLINE: "1900 4515",
    PORTRAIT: "PORTRAIT",
    LANDSCAPE: "LANDSCAPE",
    TABLET: "TABLET",
    PHONE: "PHONE",
    CURRENT_ACCOUNT: "CURRENT_ACCOUNT",
    LOAD_LIMIT: 40,
    VENDOR_SESSION: "VENDOR_SESSION",
    IPPRINT: "IPPRINT",
    SIZE_INPUT: "SIZE_INPUT",
    CURRENT_BRANCH: "CURRENT_BRANCH",
    LAST_BRANCH: "LAST_BRANCH",
    REMEMBER_ACCOUNT: "REMEMBER_ACCOUNT",
    PROVISIONAL_PRINT: "PROVISIONAL_PRINT",
    ALREADY_INSERT_PRODUCT: 'ALREADY_INSERT_PRODUCT',
    HISTORY_ORDER: "HISTORY_ORDER",
    ID_VNPAY_QR: 978,
    OBJECT_SETTING: 'OBJECT_SETTING',
    LANGUAGE: "LANGUAGE",
    KEY_PRINTER: {
        CashierKey: 'CashierPrint',
        KitchenAKey: 'KitchenA',
        KitchenBKey: 'KitchenB',
        KitchenCKey: 'KitchenC',
        KitchenDKey: 'KitchenD',
        BartenderAKey: 'BartenderA',
        BartenderBKey: 'BartenderB',
        BartenderCKey: 'BartenderC',
        BartenderDKey: 'BartenderD',
        StampPrintKey: 'StamPrintKey',
    },
    TIME_FOR_REPORT: [
        {
            type: 4,
            name: "hom_nay",
            key: "today"
        },
        {
            type: 3,
            name: "hom_qua",
            key: "yesterday"
        },
        {
            type: 1,
            name: "bay_ngay",
            key: "7days"
        },

        {
            type: 2,
            name: "tuy_chon",
            key: "custom"
        }
    ]
    ,
    TIME_SELECT: [
        {
            type: 4,
            name: "hom_nay",
            key: "today"
        },
        {
            type: 3,
            name: "hom_qua",
            key: "yesterday"
        },
        {
            type: 1,
            name: "bay_ngay",
            key: "7days"
        },
        {
            type: 2,
            name: "thang_nay",
            key: "month"
        },
        {
            type: 2,
            name: "thang_truoc",
            key: "lastmonth"
        },
        // {
        //     type: 5,
        //     name: "tuy_chon",
        //     key: "custom"
        // }
    ],
    TIME_SELECT_CUSTOM_TIME: [
        {
            type: 4,
            name: "hom_nay",
            key: "today"
        },
        {
            type: 3,
            name: "hom_qua",
            key: "yesterday"
        },
        {
            type: 1,
            name: "bay_ngay",
            key: "7days"
        },
        {
            type: 2,
            name: "thang_nay",
            key: "month"
        },
        {
            type: 6,
            name: "thang_truoc",
            key: "lastmonth"
        },
        {
            type: 5,
            name: "tuy_chon",
            key: "custom"
        }
    ],

    TIME_SELECT_ALL_TIME: [
        {
            type: 4,
            name: "hom_nay",
            key: "today"
        },
        {
            type: 3,
            name: "hom_qua",
            key: "yesterday"
        },
        {
            type: 1,
            name: "bay_ngay",
            key: "7days"
        },
        {
            type: 2,
            name: "thang_nay",
            key: "month"
        },
        {
            type: 6,
            name: "toan_thoi_gian",
            key: ""
        },
        {
            type: 5,
            name: "tuy_chon",
            key: "custom"
        }
    ],
    STATUS_FILTER: [
        {
            name: "tat_ca",
            key: ''
        },
        {
            name: "dat_hang",
            key: 1
        },
        {
            name: "hoan_thanh",
            key: 2
        },
        {
            name: "huy",
            key: 3
        },
    ],
    METHOD: {
        payment_paid: {
            name: "Payment paid",
            value: '0'
        },
        vat: {
            name: "VAT",
            value: '0'
        },
        discount: {
            name: "Discount",
            value: '0'
        },
    },

    LIST_PROVICE: [
        {
            key: 1,
            name: "An Giang"
        },
        {
            key: 2,
            name: "Bà rịa – Vũng tàu"
        },
        {
            key: 3,
            name: "Bắc Giang"
        },
        {
            key: 4,
            name: "Bắc Kạn"
        },
        {
            key: 5,
            name: "Bạc Liêu"
        },
        {
            key: 6,
            name: "Bắc Ninh"
        },
        {
            key: 7,
            name: "Bến Tre"
        },
        {
            key: 8,
            name: "Bình Định"
        },
        {
            key: 9,
            name: "Bình Dương"
        },
        {
            key: 10,
            name: "Bình Phước"
        },
        {
            key: 11,
            name: "Bình Thuận"
        },
        {
            key: 12,
            name: "Cà Mau"
        },
        {
            key: 13,
            name: "Cần Thơ"
        },
        {
            key: 14,
            name: "Cao Bằng"
        },
        {
            key: 15,
            name: "Đà Nẵng"
        },
        {
            key: 16,
            name: "Đắk Lắk"
        },
        {
            key: 17,
            name: "Đắk Nông"
        },
        {
            key: 18,
            name: "Điện Biên"
        },
        {
            key: 19,
            name: "Đồng Nai"
        },
        {
            key: 20,
            name: "Đồng Tháp"
        },
        {
            key: 21,
            name: "Gia Lai"
        },
        {
            key: 22,
            name: "Hà Giang"
        },
        {
            key: 23,
            name: "Hà Nam"
        },
        {
            key: 24,
            name: "Hà Nội"
        },
        {
            key: 25,
            name: "Hà Tĩnh"
        },
        {
            key: 26,
            name: "Hải Dương"
        },
        {
            key: 27,
            name: "Hải Phòng"
        },
        {
            key: 28,
            name: "Hậu Giang"
        },
        {
            key: 29,
            name: "Hòa Bình"
        },
        {
            key: 30,
            name: "Hưng Yên"
        },
        {
            key: 31,
            name: "Khánh Hòa"
        },
        {
            key: 32,
            name: "Kiên Giang"
        },
        {
            key: 33,
            name: "Kon Tum"
        },
        {
            key: 34,
            name: "Lai Châu"
        },
        {
            key: 35,
            name: "Lâm Đồng"
        },
        {
            key: 36,
            name: "Lạng Sơn"
        },
        {
            key: 37,
            name: "Lào Cai"
        },
        {
            key: 38,
            name: "Long An"
        },
        {
            key: 39,
            name: "Nam Định"
        },
        {
            key: 40,
            name: "Nghệ An"
        },
        {
            key: 41,
            name: "Ninh Bình"
        },
        {
            key: 42,
            name: "Ninh Thuận"
        },
        {
            key: 43,
            name: "Phú Thọ"
        },
        {
            key: 44,
            name: "Phú Yên"
        },
        {
            key: 45,
            name: "Quảng Bình"
        },
        {
            key: 46,
            name: "Quảng Nam"
        },
        {
            key: 47,
            name: "Quảng Ngãi"
        },
        {
            key: 48,
            name: "Quảng Ninh"
        },
        {
            key: 49,
            name: "Quảng Trị"
        },
        {
            key: 50,
            name: "Sóc Trăng"
        },
        {
            key: 51,
            name: "Sơn La"
        },
        {
            key: 52,
            name: "Tây Ninh"
        },
        {
            key: 53,
            name: "Thái Bình"
        },
        {
            key: 54,
            name: "Thái Nguyên"
        },
        {
            key: 55,
            name: "Thanh Hóa"
        },
        {
            key: 56,
            name: "Thừa Thiên Huế"
        },
        {
            key: 57,
            name: "Tiền Giang"
        },
        {
            key: 58,
            name: "Thành phố Hồ Chí Minh"
        },
        {
            key: 59,
            name: "Trà Vinh"
        },
        {
            key: 60,
            name: "Tuyên Quang"
        },
        {
            key: 61,
            name: "Vĩnh Long"
        },
        {
            key: 62,
            name: "Vĩnh Phúc"
        },
        {
            key: 63,
            name: "Yên Bái"
        },


    ]
    ,
    CATYGORY_PRINT: [
        // {
        //     name: "khong_in",
        //     key: ''
        // },
        {
            name: "in_qua_mang_lan",
            key: 1
        },
        {
            name: "in_qua_bluetooth",
            key: 2
        },
        {
            name: "in_qua_usb",
            key: 3
        }
    ],
    STAMP_PRINTER: [
        {
            name: "in_qua_mang_lan",
            key: 1
        },
        {
            name: "in_qua_usb",
            key: 2
        }
    ],
    CURRENTCY_UNIT: [
        {
            name: "Dollar Mỹ",
            key: 1,
            value: '$'
        },
        {
            name: "Không hiển thị",
            key: 2,
            value: 'không hiển thị'
        }

    ],
    JSONCONTENT_EMPTY: {
        OrderDetails: []
    }
    ,
    PRINT_KITCHEN_DEFAULT: 'KitchenA',

};