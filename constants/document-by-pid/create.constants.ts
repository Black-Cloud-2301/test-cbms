import {ICreate} from '../interface';

export const CreateData: ICreate[] = [
    {
        type: 'autocomplete',
        field: 'employeeId',
        value: 'Giang Thị Nhung',
    },
    {
        type: 'select',
        field: 'positionId',
        value: 'Thành viên',
    },
    {
        type: 'text',
        field: 'divisionLabor',
        value: 'Phân công công việc',
    }
]

export const SearchData: ICreate[] = [
/*    {
        type: 'multiselect',
        field: 'contractorPrices',
        value: 'dưới,từ,trên',
    },*/
    {
        type: 'date',
        field: 'createdAt',
        value: '11/03/2025',
    },
]