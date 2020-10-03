export const Constant = {
    HOTLINE: "1900 4515",
    PORTRAIT: "PORTRAIT",
    LANDSCAPE: "LANDSCAPE",
    TABLET: "TABLET",
    PHONE: "PHONE",
    CURRENT_ACCOUNT: "CURRENT_ACCOUNT",
    LOAD_LIMIT: 20,
    VENDOR_SESSION: "VENDOR_SESSION",
    IPPRINT: "IPPRINT",
    SIZE_INPUT: "SIZE_INPUT",
    CURRENT_BRANCH: "CURRENT_BRANCH",
    REMEMBER_ACCOUNT: "REMEMBER_ACCOUNT",
    PROVISIONAL_PRINT: "PROVISIONAL_PRINT",
    ALREADY_INSERT_PRODUCT: 'ALREADY_INSERT_PRODUCT',
    HISTORY_ORDER: "HISTORY_ORDER",
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
    METHOD: [
        {
            name: "Payment paid",
            key: 0
        },
        {
            name: "VAT",
            key: 1
        },
        {
            name: "Discount",
            key: 2
        },
    ]
};