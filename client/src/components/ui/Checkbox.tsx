type CheckboxProps = {
    label: string;
    id: string;
};

const Checkbox = ({ label, id }: CheckboxProps) => (
    <div className="flex items-center space-x-2">
        <input type="checkbox" id={id} className="h-4 w-4 text-black" />
        <label htmlFor={id} className="text-sm text-gray-700">
            {label}
        </label>
    </div>
);

export default Checkbox;
