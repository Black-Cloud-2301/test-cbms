import {IValidateTableColumn} from './validate-table.constants';

export const validatePolicyTable: IValidateTableColumn[] = [
  {
    type: 'checkbox'
  },
  {
    title: 'STT',
    type: 'number',
    align: 'center'
  },
  {
    title: 'Thao tác',
    type: 'action',
  },
  {
    title: 'Mã chủ trương',
    type: 'link',
  },
  {
    title: 'Tên chủ trương',
    type: 'text',
  },
  {
    title: 'Trạng thái',
    type: 'text',
    optionValue: ['1. Mới tạo', '2. Trình thẩm định', '3. Đã thẩm định', '4. Từ chối thẩm định']
  },
  {
    title: 'Nhóm dự án',
    type: 'text',
    optionValue: 'PROJECT_GROUP'
  },
  {
    title: 'Lĩnh vực đầu tư',
    type: 'text',
    optionValue: ["BTS", "DAS", "Nâng cấp nguồn", "Ngầm hóa", "Cáp quang treo", "Pin mặt trời", "CCDC", "CNTT", "Phương tiện vận chuyển revo", "TS khác"]
  },
  {
    title: 'Loại dự án',
    type: 'text',
    optionValue: "PROJECT_TYPE"
  },
  {
    title: 'Tổng mức đầu tư',
    type: 'currency',
  },
  {
    title: 'Thời gian tạo',
    type: 'date',
  },
  {
    title: 'Người tạo',
    type: 'text',
  },
  {
    title: 'Đơn vị tạo',
    type: 'text',
  },
]

export const validateProjectTable: IValidateTableColumn[] = [
  {
    type: 'checkbox'
  },
  {
    title: 'STT',
    type: 'number',
    align: 'center'
  },
  {
    title: 'Thao tác',
    type: 'action',
  },
  {
    title: 'Mã dự án',
    type: 'link',
  },
  {
    title: 'Tên dự án',
    type: 'text',
  },
  {
    title: 'Trạng thái',
    type: 'text',
    optionValue: ['1. Mới tạo', '2. Trình thẩm định', '3. Đã thẩm định', '4. Từ chối thẩm định']
  },
  {
    title: 'Nhóm dự án',
    type: 'text',
    optionValue: 'PROJECT_GROUP'
  },
  {
    title: 'Lĩnh vực đầu tư',
    type: 'text',
    optionValue: ["BTS", "DAS", "Nâng cấp nguồn", "Ngầm hóa", "Cáp quang treo", "Pin mặt trời", "CCDC", "CNTT", "Phương tiện vận chuyển revo", "TS khác"]
  },
  {
    title: 'Loại dự án',
    type: 'text',
    optionValue: "PROJECT_TYPE"
  },
  {
    title: 'Tổng mức đầu tư (VNĐ)',
    type: 'currency',
  },
  {
    title: 'Thời gian tạo',
    type: 'date',
  },
  {
    title: 'Người tạo',
    type: 'text',
  },
  {
    title: 'Đơn vị tạo',
    type: 'text',
  },
]

export const validatePurchaseTable: IValidateTableColumn[] = [
  {
    type: 'checkbox'
  },
  {
    title: 'STT',
    type: 'number',
    align: 'center'
  },
  {
    title: 'Thao tác',
    type: 'action',
  },
  {
    title: 'Mã đề xuất mua sắm',
    type: 'link',
  },
  {
    title: 'Tên đề xuất mua sắm',
    type: 'text',
  },
  {
    title: 'Trạng thái',
    type: 'text',
    optionValue: ['1. Mới tạo', '2. Chuẩn bị tạo kế hoạch thầu']
  },
  {
    title: 'Thời gian tạo',
    type: 'date',
    format: 'DD/MM/YYYY HH:mm'
  },
  {
    title: 'Giá trị đề xuất mua sắm',
    type: 'currency',
  },
  {
    title: 'Người tạo',
    type: 'text',
  },
  {
    title: 'Đơn vị tạo',
    type: 'text',
  },
]

export const validateSelectPlanTable: IValidateTableColumn[] = [
  {
    type: 'checkbox'
  },
  {
    title: 'STT',
    type: 'number',
    align: 'center'
  },
  {
    title: 'Thao tác',
    type: 'action',
  },
  {
    title: 'Mã KHLCNT',
    type: 'link',
  },
  {
    title: 'Tên KHLCNT',
    type: 'text',
  },
  {
    title: 'Trạng thái',
    type: 'text',
    optionValue: ['1. Mới tạo', '2. Trình thẩm định', '3. Đã thẩm định', '4. Từ chối thẩm định']
  },
  {
    title: 'Mã dự án',
    type: 'text',
  },
  {
    title: 'Tên dự án',
    type: 'text',
  },
  {
    title: 'Tổng mức đầu tư (VNĐ)',
    type: 'currency',
  },
  {
    title: 'Nguồn đầu vào',
    type: 'text',
    optionValue: ['Dự án đầu tư', 'Mua sắm thường xuyên']
  },
  {
    title: 'Người tạo',
    type: 'text',
  },
  {
    title: 'Ngày tạo',
    type: 'date',
  },
  {
    title: 'Đơn vị tạo',
    type: 'text',
  },
]