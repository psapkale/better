type Props = {
   type?: string; // optional
   title: string;
   state: string;
   placeholder: string;
   isTextArea?: boolean; // optional
   setState: (value: string) => void;
};

const FormField = ({
   type,
   title,
   state,
   placeholder,
   isTextArea,
   setState,
}: Props) => {
   return (
      <div className='flexStart flex-col w-full gap-4'>
         <label htmlFor='' className='w-full text-gray-100'>
            {title}
         </label>

         {isTextArea ? (
            <textarea
               placeholder={placeholder}
               value={state}
               required
               className='form_field-input'
               onChange={(e) => setState(e.target.value)}
            />
         ) : (
            <input
               type={type || 'text'}
               placeholder={placeholder}
               value={state}
               required
               className='form_field-input'
               onChange={(e) => setState(e.target.value)}
            />
         )}
      </div>
   );
};

export default FormField;
