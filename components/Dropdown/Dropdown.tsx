import AddOptionModal from './AddOptionModal';
import clsx from 'clsx';
import { DropdownProps, DropdownItem } from '@/utils/types';
import '@/styles/scrollbar.css';
import React, {
  FC,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

const Dropdown: FC<DropdownProps> = ({
  items,
  label = "क्र.",
  onSelect,
  defaultValue,
  className = "",
  id,
  buttonBgColor = "bg-[#6378fd]",
  buttonBorderWidth = "border-[1.5px]",
  buttonBorderColor = "border-black",
  containerClass = "",
  selected: controlledSelected,
  onChange,
  allowAddOption = false,
  allowAddOptionText = "Add new option",
  onAddOption,
  isDynamic = false, // Default to false
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | number | null>(
    controlledSelected ?? defaultValue ?? null
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [showModal, setShowModal] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Update selected state based on controlledSelected and defaultValue
  useEffect(() => {
    if (controlledSelected !== undefined) {
      setSelected(controlledSelected);
    } else {
      setSelected(defaultValue ?? null);
    }
  }, [defaultValue, controlledSelected]);

  // Synchronize internal options state with items prop
  const [options, setOptions] = useState<DropdownItem[]>(items);

  useEffect(() => {
    setOptions(items);
  }, [items]);

  // Memoize final options, including the "Add new option" if allowed
  const finalOptions = useMemo(() => {
    const safeText =
      typeof allowAddOptionText === "string" ||
      typeof allowAddOptionText === "number"
        ? allowAddOptionText
        : JSON.stringify(allowAddOptionText);

    if (allowAddOption) {
      const addOptionItem: DropdownItem = {
        id: 'add_option',
        name: safeText.toString(),
      };
      return [addOptionItem, ...options];
    }
    return options;
  }, [allowAddOption, allowAddOptionText, options]);

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      setHighlightedIndex(-1);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleOptionClick = useCallback(
    (option: DropdownItem) => {
      if (allowAddOption && option.id === 'add_option') {
        setIsOpen(false);
        setShowModal(true);
        return;
      }

      // Handle selection
      const selectedId = option.id;

      if (controlledSelected !== undefined) {
        onSelect?.(selectedId);
        onChange?.(selectedId);
      } else {
        setSelected(selectedId);
        onSelect?.(selectedId);
        onChange?.(selectedId);
      }

      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [allowAddOption, onSelect, onChange, controlledSelected]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < finalOptions.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : finalOptions.length - 1
        );
      } else if (event.key === "Enter" || event.key === " ") {
        if (highlightedIndex >= 0 && highlightedIndex < finalOptions.length) {
          const option = finalOptions[highlightedIndex];
          handleOptionClick(option, highlightedIndex);
        }
      } else if (event.key === "Tab") {
        setIsOpen(false);
      }
    },
    [highlightedIndex, finalOptions, handleOptionClick]
  );

  const handleModalConfirm = useCallback(
    (newValue: string) => {
      if (allowAddOption && isDynamic) {
        const existingOption = options.find(opt => opt.name === newValue);
        if (!existingOption) {
          const newOptionName = newValue.trim();
          if (newOptionName) {
            onAddOption?.(newOptionName); // Pass only the name as string
          }
        }
      }
      setShowModal(false);
    },
    [options, onAddOption, isDynamic, allowAddOption]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const renderedOptions = useMemo(() => {
    return finalOptions.map((option, index) => {
      const isSelected = selected === option.id;
      const isHighlighted = highlightedIndex === index;
      const isAddOptionText = allowAddOption && option.id === 'add_option';

      return (
        <div
          key={`${option.id}-${index}`}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleOptionClick(option, index)}
          onKeyDown={(e) =>
            e.key === "Enter" && handleOptionClick(option, index)
          }
          onMouseEnter={() => setHighlightedIndex(index)}
          className={clsx(
            "cursor-pointer text-lg",
            isSelected && "bg-blue-100",
            !isSelected && isHighlighted && "bg-blue-50",
            !isSelected && !isHighlighted && "bg-white",
            "hover:bg-blue-50",
            index !== finalOptions.length - 1 && "border-b border-gray-200",
            "px-4 py-2",
            isAddOptionText && "text-[#0019fb]"
          )}
        >
          {option.name}
        </div>
      );
    });
  }, [finalOptions, selected, highlightedIndex, handleOptionClick, allowAddOption]);

  // Determine the display value
  const displayValue = useMemo(() => {
    if (isDynamic) {
      const selectedItem = options.find((opt) => opt.id === selected);
      return selectedItem ? selectedItem.name : "-";
    } else {
      return selected ?? "-";
    }
  }, [isDynamic, options, selected]);

  return (
    <div
      className={clsx(
        "laila-regular relative w-full",
        className,
        containerClass
      )}
    >
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id ? `${id}-listbox` : "dropdown-listbox"}
        disabled={disabled} // Apply disabled attribute
        className={clsx(
          "mt-2 flex items-center",
          buttonBgColor,
          "text-white px-3 py-2 rounded-[20px] shadow-2xl gap-2",
          buttonBorderWidth,
          buttonBorderColor,
          "w-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500",
          "h-[50px] text-left",
          disabled && "opacity-50 cursor-not-allowed" // Add styles for disabled state
        )}
      >
        <span className="mr-2 flex-grow text-xl">{label}</span>
        <div className="w-[80%] h-9 bg-white text-lg rounded-lg flex items-center justify-center text-black mr-2 overflow-hidden whitespace-nowrap text-ellipsis">
          {displayValue}
        </div>

        <svg
          className={clsx(
            "w-4 h-4 transform transition-transform duration-200",
            isOpen ? "rotate-0" : "rotate-180"
          )}
          xmlns="http://www.w3.org/2000/svg"
          version="1.0"
          width="1280.000000pt"
          height="1153.000000pt"
          viewBox="0 0 1280.000000 1153.000000"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform="translate(0.000000,1153.000000) scale(0.100000,-0.100000)"
            fill="#ffffff"
            stroke="none"
          >
            <path d="M6300 11519 c-423 -46 -838 -228 -1114 -490 -118 -111 -201 -217 -289 -364 -216 -364 -4708 -8206 -4742 -8280 -208 -444 -205 -916 9 -1361 226 -470 672 -835 1179 -965 225 -57 -205 -53 5032 -56 3271 -3 4831 0 4898 7 494 52 915 308 1198 729 156 231 256 484 306 776 21 124 24 452 5 570 -28 172 -78 338 -160 535 -202 484 -448 929 -992 1795 -507 806 -375 581 -2120 3630 -821 1436 -1520 2655 -1553 2710 -86 146 -145 221 -260 331 -231 222 -515 359 -873 420 -109 18 -409 26 -524 13z" />
          </g>
        </svg>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          id={id ? `${id}-listbox` : "dropdown-listbox"}
          className="absolute thin-scrollbar left-0 mt-1 w-full bg-white text-black text-center rounded-[20px] shadow-lg z-10 max-h-52 overflow-y-auto"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {renderedOptions}
        </div>
      )}

      <AddOptionModal
        visible={showModal}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title="नवीन तयार करा"
        placeholder="enter name here"
      />
    </div>
  );
}

Dropdown.displayName = "Dropdown";

export default Dropdown;
