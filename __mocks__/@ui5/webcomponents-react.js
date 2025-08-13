import React from 'react';
import { AnalyticalTable } from './AnalyticalTable';

const Button = React.forwardRef(
  (
    { icon, endIcon, className, onClick, children, disabled, ...props },
    ref
  ) => {
    const { endIcon: _endIcon, ...restProps } = props;
    const handleClick = (e) => {
      // Always call onClick even if disabled (for testing purposes)
      if (onClick) {
        onClick(e);
      }
    };
    return (
      <button
        ref={ref}
        className={className}
        onClick={handleClick}
        disabled={disabled}
        data-testid={props['data-testid'] ?? 'ui5-button'}
        {...restProps}
      >
        {icon && <span data-testid="ui5-icon">{icon}</span>}
        {children}
        {endIcon && <span data-testid="ui5-end-icon">{endIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

const Card = React.forwardRef(
  ({ children, className, onClick, header, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      onClick={onClick}
      data-testid="ui5-card"
      {...props}
    >
      {header}

      {children}
    </div>
  )
);
Card.displayName = 'Card';

const ComboBox = React.forwardRef(({ children, ...props }, ref) => (
  <select ref={ref} data-testid="ui5-combobox" {...props}>
    {children}
  </select>
));
ComboBox.displayName = 'ComboBox';

const DatePicker = React.forwardRef(
  ({ placeholder, maxDate, minDate, onChange, value, ...props }, ref) => {
    const handleChange = (event) => {
      const value = event.target.value;
      if (onChange) {
        // Create the UI5-style event structure that the component expects
        onChange({ detail: { value } });
      }
    };

    return (
      <input
        ref={ref}
        type="date"
        placeholder={placeholder}
        data-testid="ui5-datepicker"
        min={minDate}
        max={maxDate}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
DatePicker.displayName = 'DatePicker';

// Simple DateRangePicker mock that behaves like a text input and emits UI5-style events
const DateRangePicker = React.forwardRef(
  ({ placeholder, onChange, value, formatPattern, ...props }, ref) => {
    const handleChange = (event) => {
      const value = event.target.value;
      if (onChange) {
        onChange({ detail: { value } });
      }
    };
    // The mock doesn't enforce formatPattern, but it's accepted to mirror the API
    return (
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        data-testid="ui5-daterange-picker"
        value={value}
        onChange={handleChange}
        data-format-pattern={formatPattern}
        {...props}
      />
    );
  }
);
DateRangePicker.displayName = 'DateRangePicker';

const Dialog = React.forwardRef(
  (
    { open, header, children, className, style, footer, onClose, ...props },
    ref
  ) =>
    open ? (
      <div
        ref={ref}
        data-testid="ui5-dialog"
        className={className}
        style={style}
        {...props}
      >
        <div>{header}</div>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null
);
Dialog.displayName = 'Dialog';

const Label = ({ children, className }) => (
  <label className={className} data-testid="ui5-label">
    {children}
  </label>
);
Label.displayName = 'Label';

const FlexBox = React.forwardRef(
  (
    { children, className, direction, alignItems, justifyContent, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        flexDirection:
          direction === 'Column' || direction === 'column' ? 'column' : 'row',
        alignItems:
          alignItems === 'Center'
            ? 'center'
            : alignItems === 'Start'
              ? 'flex-start'
              : alignItems === 'End'
                ? 'flex-end'
                : undefined,
        justifyContent:
          justifyContent === 'Center'
            ? 'center'
            : justifyContent === 'SpaceBetween'
              ? 'space-between'
              : justifyContent === 'SpaceAround'
                ? 'space-around'
                : undefined,
        ...props.style,
      }}
      data-testid={'ui5-flexbox'}
      data-direction={direction}
      {...props}
    >
      {children}
    </div>
  )
);
FlexBox.displayName = 'FlexBox';

const Form = React.forwardRef(({ children, className }, ref) => (
  <div ref={ref} className={className} data-testid="ui5-form-layout">
    {children}
  </div>
));
Form.displayName = 'Form';

const Input = React.forwardRef(
  ({ placeholder, maxlength, onInput, onChange, ...props }, ref) => {
    const handleInput = (event) => {
      if (onInput) {
        onInput({ target: { value: event.target.value } });
      }
      if (onChange) {
        onChange({ target: { value: event.target.value } });
      }
    };

    return (
      <input
        ref={ref}
        placeholder={placeholder}
        maxLength={maxlength}
        data-testid="ui5-input"
        onChange={handleInput}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

const List = ({ children, className, onClick, ...props }) => (
  <ul className={className} data-testid="ui5-list" onClick={onClick} {...props}>
    {children}
  </ul>
);
List.displayName = 'List';

const ListItem = ({ children, onClick, ...props }) => (
  <li onClick={onClick} data-testid="ui5-list-item" {...props}>
    {children}
  </li>
);
ListItem.displayName = 'ListItem';

const ListItemCustom = ({ children, className, onClick }) => (
  <li
    className={className}
    data-testid="ui5-list-item-custom"
    onClick={onClick}
  >
    {children}
  </li>
);
ListItemCustom.displayName = 'ListItemCustom';

const ListItemStandard = ({ children, className, onClick, ...props }) => (
  <li
    className={className}
    data-testid="ui5-list-item-standard"
    onClick={onClick}
    {...props}
  >
    {children}
  </li>
);
ListItemStandard.displayName = 'ListItemStandard';

const Popover = ({
  children,
  open,
  className,
  header,
  onClose,
  horizontalAlign: _horizontalAlign,
  hideArrow: _hideArrow,
  verticalAlign: _verticalAlign,
  placement: _placement,
  opener: _opener,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return isOpen ? (
    <div
      className={className}
      data-testid="ui5-popover"
      onClick={() => {
        onClose?.();
        setIsOpen(false);
      }}
      {...props}
    >
      <div data-testid="ui5-popover-header">{header}</div>
      <div data-testid="ui5-popover-content">{children}</div>
    </div>
  ) : null;
};
Popover.displayName = 'Popover';

const MultiComboBox = React.forwardRef(
  ({ children, placeholder, onSelectionChange, value = [], ...props }, ref) => {
    const handleChange = (event) => {
      const selectedOptions = Array.from(event.target.selectedOptions).map(
        (opt) => ({
          text: opt.value,
        })
      );
      onSelectionChange?.({ detail: { items: selectedOptions } });
    };

    const selectedValues =
      value && Array.isArray(value)
        ? value
        : React.Children.toArray(children)
            .filter((child) => child.props && child.props.selected)
            .map((child) => child.props.text);

    return (
      <select
        multiple
        ref={ref}
        data-testid="ui5-multi-combobox"
        placeholder={placeholder}
        value={selectedValues}
        onChange={handleChange}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            selected: undefined,
          })
        )}
      </select>
    );
  }
);
MultiComboBox.displayName = 'MultiComboBox';

const MultiComboBoxItem = ({ text }) => <option value={text}>{text}</option>;
MultiComboBoxItem.displayName = 'MultiComboBoxItem';

const Tag = ({ children }) => <div data-testid="ui5-tag">{children}</div>;
Tag.displayName = 'Tag';

const Grid = ({ children }) => <div data-testid="ui5-grid">{children}</div>;

export const Select = ({ children, value, onChange, valueState, ...props }) => {
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    if (onChange) {
      const selectedOption = React.Children.toArray(children).find(
        (child) => child.props && child.props.value === selectedValue
      );
      // The component expects selectedOption.value, so we create a plain object
      const selectedOptionValue = selectedOption
        ? {
            value: selectedOption.props.value,
            text: selectedOption.props.children,
          }
        : { value: selectedValue === 'nullish-test' ? null : selectedValue };

      onChange({ detail: { selectedOption: selectedOptionValue } });
    }
  };

  return (
    <select
      data-testid="select"
      value={value}
      onChange={handleChange}
      data-state={valueState}
      {...props}
    >
      {children}
    </select>
  );
};

Select.displayName = 'Select';

export const Option = ({ children, value, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
);

Option.displayName = 'Option';

const Table = ({
  children,
  className,
  features,
  overflowMode,
  headerRow,
  noDataText,
}) => {
  // Check if there are any table rows in children
  const hasTableRows = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) && child.type?.displayName === 'TableRow'
  );

  return (
    <div
      className={className}
      role="table"
      data-testid="ui5-table"
      data-overflow-mode={overflowMode}
    >
      {headerRow}
      {features}
      {children}
      {!hasTableRows && noDataText && (
        <div data-testid="ui5-table-row">
          <div data-testid="ui5-table-cell">
            <span data-testid="ui5-text">{noDataText}</span>
            <br />
            <span data-testid="ui5-text">Try adjusting your search terms</span>
          </div>
        </div>
      )}
    </div>
  );
};
Table.displayName = 'Table';

const TableHeaderRow = ({ children, sticky, ...props }) => (
  <div
    className={props.className}
    role="rowheader"
    data-testid="ui5-table-header-row"
    data-sticky={sticky}
  >
    {children}
  </div>
);
TableHeaderRow.displayName = 'TableHeaderRow';

const TableHeaderCell = ({
  children,
  className,
  horizontalAlign,
  minWidth,
  maxWidth,
  onClick,
  ...props
}) => (
  <div
    className={className}
    style={{
      textAlign: horizontalAlign?.toLowerCase(),
      minWidth,
      maxWidth,
    }}
    onClick={onClick}
    role="columnheader"
    data-testid="ui5-table-header-cell"
    data-key={props.key}
  >
    {children}
  </div>
);
TableHeaderCell.displayName = 'TableHeaderCell';

const TableRow = ({ children, className, style, rowKey, ...props }) => {
  const uiRowKey = props['data-ui5-row-key'] || rowKey;
  return (
    <div
      className={className}
      role="row"
      style={style}
      data-testid="ui5-table-row"
      data-ui5-row-key={uiRowKey}
      data-key={props.key}
    >
      {children}
    </div>
  );
};
TableRow.displayName = 'TableRow';

const TableCell = ({ children, className, ...props }) => (
  <div
    className={className}
    role="cell"
    data-testid="ui5-table-cell"
    data-key={props.key}
  >
    {children}
  </div>
);
TableCell.displayName = 'TableCell';

const TableSelectionMulti = ({ behavior, ...props }) => (
  <div
    data-testid="ui5-table-selection-multi"
    data-behavior={behavior}
    data-key={props.key}
  />
);
TableSelectionMulti.displayName = 'TableSelectionMulti';

const TableGrowing = ({ mode, ...props }) => (
  <div data-testid="ui5-table-growing" data-mode={mode} data-key={props.key} />
);
TableGrowing.displayName = 'TableGrowing';

const Icon = React.forwardRef(({ name, className, ...props }, ref) => (
  <span ref={ref} className={className} data-testid="ui5-icon" {...props}>
    {name}
  </span>
));
Icon.displayName = 'Icon';

const RadioButton = React.forwardRef(
  (
    {
      checked,
      onChange,
      value,
      name,
      className,
      children,
      text,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <label
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          ...style,
        }}
      >
        <input
          ref={ref}
          type="radio"
          checked={checked}
          onChange={onChange}
          value={value}
          name={name}
          data-testid="ui5-radio-button"
          {...props}
        />
        <span style={{ marginLeft: 4 }}>{text || children}</span>
      </label>
    );
  }
);
RadioButton.displayName = 'RadioButton';

const Switch = React.forwardRef(({ name, className, ...props }, ref) => (
  <label className={className}>
    <input type="checkbox" name={name} ref={ref} {...props} />
    <span className="slider round"></span>
  </label>
));
Switch.displayName = 'Switch';

// Toolbar components
const Toolbar = React.forwardRef(
  ({ children, className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={style}
      data-testid="ui5-toolbar"
      {...props}
    >
      {children}
    </div>
  )
);
Toolbar.displayName = 'Toolbar';

const ToolbarSpacer = React.forwardRef(({ ...props }, ref) => (
  <div
    ref={ref}
    data-testid="ui5-toolbar-spacer"
    style={{ flex: 1 }}
    {...props}
  />
));
ToolbarSpacer.displayName = 'ToolbarSpacer';

const ToolbarSeparator = React.forwardRef(({ ...props }, ref) => (
  <div
    ref={ref}
    data-testid="ui5-toolbar-separator"
    style={{
      width: '1px',
      backgroundColor: 'var(--sapToolbar_SeparatorColor)',
      margin: '0 8px',
    }}
    {...props}
  />
));
ToolbarSeparator.displayName = 'ToolbarSeparator';

const ToolbarButton = React.forwardRef(
  ({ design, icon, onClick, children, ...props }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      data-testid="ui5-toolbar-button"
      data-design={design}
      data-icon={icon}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '8px',
        cursor: 'pointer',
      }}
      {...props}
    >
      {icon && <span data-testid="ui5-icon">{icon}</span>}
      {children}
    </button>
  )
);
ToolbarButton.displayName = 'ToolbarButton';

// Menu components
const Menu = React.forwardRef(
  ({ children, open, onClose, opener, horizontalAlign, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open);

    React.useEffect(() => {
      setIsOpen(open);
    }, [open]);

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    return isOpen ? (
      <div
        ref={ref}
        data-testid="ui5-menu"
        data-horizontal-align={horizontalAlign}
        onClick={handleClose}
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '120px',
        }}
        {...props}
      >
        {children}
      </div>
    ) : null;
  }
);
Menu.displayName = 'Menu';

const MenuItem = React.forwardRef(
  ({ children, icon, text, onClick, disabled, ...props }, ref) => {
    const handleClick = (e) => {
      if (!disabled && onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        data-testid="ui5-menu-item"
        data-icon={icon}
        data-text={text}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        {...props}
      >
        {icon && <span data-testid="ui5-icon">{icon}</span>}
        {text || children}
      </button>
    );
  }
);
MenuItem.displayName = 'MenuItem';

// Improved Tab Component
const Tab = ({ text, selected, children, onClick, 'data-key': dataKey }) => (
  <div
    data-selected={selected}
    data-label={text}
    data-key={dataKey}
    onClick={onClick}
    data-testid="ui5-tab"
    style={{
      display: selected ? 'block' : 'none',
    }}
  >
    <label style={{ display: 'none' }}>{text}</label>
    {selected && children}
  </div>
);
Tab.displayName = 'Tab';

// Improved TabContainer Component
const TabContainer = ({ children, className, onTabSelect }) => {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const tabs = React.Children.toArray(children);

  const handleTabClick = (index) => {
    setSelectedTabIndex(index);
    if (onTabSelect) {
      onTabSelect({
        detail: {
          tabIndex: index,
          tab: tabs[index],
        },
      });
    }
  };

  return (
    <div
      className={className}
      data-testid="ui5-tab-container"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Tab Headers */}
      <div
        data-testid="ui5-tab-headers"
        style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5',
          flexShrink: 0,
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            data-testid={`ui5-tab-header-${index}`}
            onClick={() => handleTabClick(index)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor:
                selectedTabIndex === index ? '#fff' : 'transparent',
              borderBottom:
                selectedTabIndex === index
                  ? '2px solid #0070f3'
                  : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: selectedTabIndex === index ? 'bold' : 'normal',
              color: selectedTabIndex === index ? '#0070f3' : '#666',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.props.text}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        data-testid="ui5-tab-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {tabs.map((tab, index) =>
          React.cloneElement(tab, {
            ...tab.props,
            selected: selectedTabIndex === index,
            key: index,
          })
        )}
      </div>
    </div>
  );
};
TabContainer.displayName = 'TabContainer';

// Title Component with improved level handling
const Title = ({ children, level, className, ...props }) => {
  const Component =
    level === 'H1'
      ? 'h1'
      : level === 'H2'
        ? 'h2'
        : level === 'H3'
          ? 'h3'
          : level === 'H4'
            ? 'h4'
            : level === 'H5'
              ? 'h5'
              : level === 'H6'
                ? 'h6'
                : 'div';

  return (
    <Component className={className} data-testid="ui5-title" {...props}>
      {children}
    </Component>
  );
};
Title.displayName = 'Title';

const CardHeader = React.forwardRef(
  ({ avatar, titleText, subtitleText, className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      data-testid="ui5-card-header"
      {...props}
    >
      <div data-testid="ui5-card-header-avatar">{avatar}</div>
      <div data-testid="ui5-card-header-title">{titleText}</div>
      <div data-testid="ui5-card-header-subtitle">{subtitleText}</div>
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

const Avatar = React.forwardRef(
  ({ initials, size, colorScheme, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="ui5-avatar"
      data-size={size}
      data-color-scheme={colorScheme}
      {...props}
    >
      {initials}
    </div>
  )
);
Avatar.displayName = 'Avatar';

const TextArea = React.forwardRef(
  ({ valueState, placeholder, className, ...props }, ref) => (
    <textarea
      ref={ref}
      placeholder={placeholder}
      className={className}
      data-state={valueState}
      data-testid="ui5-textarea"
      {...props}
    />
  )
);
TextArea.displayName = 'TextArea';

module.exports = {
  AnalyticalTable,
  BusyIndicator: () => <div data-testid="ui5-busy-indicator" />,
  Button,
  Card,
  CheckBox: ({ children, ...props }) => (
    <button type="button" data-testid="ui5-checkbox" {...props}>
      {children}
    </button>
  ),
  ComboBox,
  ComboBoxItem: ({ text, additionalText }) => (
    <option value={text}>
      {text} {additionalText}
    </option>
  ),
  DatePicker,
  DateRangePicker,
  Dialog,
  FlexBox,
  Form,
  FormGroup: ({ children }) => (
    <div data-testid="ui5-form-group">{children}</div>
  ),
  FormItem: ({ children, labelContent }) => (
    <div data-testid="ui5-form-item">
      <label>{labelContent}</label>
      {children}
    </div>
  ),
  Input,
  Label: ({ children, className }) => (
    <span className={className}>{children}</span>
  ),
  Page: ({ children, ...props }) =>
    React.createElement(
      'div',
      { 'data-testid': 'ui5-page', ...props },
      children
    ),
  MessageStrip: ({ children, design, ...props }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'ui5-messagestrip',
        'data-design': design,
        ...props,
      },
      children
    ),
  ShellBar: ({
    children,
    primaryTitle,
    secondaryTitle,
    profile,
    onProfileClick,
    ...props
  }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'ui5-shellbar',
        'data-primary-title': primaryTitle,
        'data-secondary-title': secondaryTitle,
        ...props,
      },
      React.createElement('h1', {}, primaryTitle),
      onProfileClick
        ? React.createElement(
            'button',
            {
              onClick: onProfileClick,
              'data-testid': 'profile-avatar',
            },
            profile
          )
        : profile,
      children
    );
  },
  ShellBarItem: ({ onClick, text, icon, children, ...props }) => {
    return React.createElement(
      'button',
      {
        onClick: onClick,
        'data-testid': 'ui5-shellbar-item',
        'data-icon': icon,
        'data-text': text,
        ...props,
      },
      text || children
    );
  },
  Avatar: ({ children, ...props }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'ui5-avatar',
        ...props,
      },
      children
    ),
  SideNavigation: ({ children, ...props }) =>
    React.createElement(
      'nav',
      {
        'data-testid': 'ui5-side-navigation',
        ...props,
      },
      children
    ),
  SideNavigationItem: ({
    text,
    icon,
    selected,
    children,
    unselectable,
    ...props
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'ui5-side-navigation-item',
        'data-text': text,
        'data-icon': icon,
        'data-selected': selected,
        ...props,
      },
      children
    ),
  SideNavigationSubItem: ({ text, ...props }) =>
    React.createElement('div', {
      'data-testid': 'ui5-side-navigation-sub-item',
      'data-text': text,
      ...props,
    }),
  Panel: ({
    headerText,
    children,
    collapsed,
    onToggle,
    noAnimation,
    ...props
  }) =>
    React.createElement(
      'button',
      {
        type: 'button',
        'data-testid': 'ui5-panel',
        'data-header-text': headerText,
        'data-collapsed': collapsed ? 'true' : 'false',
        onClick: onToggle ? () => onToggle() : undefined,
        style: {
          border: 'none',
          background: 'none',
          padding: 0,
          width: '100%',
          textAlign: 'left',
        },
        ...props,
      },
      children
    ),
  Link: ({ href, children, ...props }) =>
    React.createElement(
      'a',
      {
        'data-testid': 'ui5-link',
        href,
        ...props,
      },
      children
    ),
  Select,
  Tab,
  TabContainer,
  Tag,
  Text: ({ children, className, style, ...props }) => (
    <span className={className} style={style} {...props} data-testid="ui5-text">
      {children?.toString()}
    </span>
  ),
  TextArea,
  ThemeProvider: ({ children }) => <>{children}</>,
  Title,
  Icon,
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  TableSelectionMulti,
  TableGrowing,
  List,
  ListItemCustom,
  ListItemStandard,
  Option,
  Popover,
  MultiComboBox,
  MultiComboBoxItem,
  RadioButton,
  Switch,
  Toolbar,
  ToolbarSpacer,
  ToolbarSeparator,
  ToolbarButton,
  Menu,
  MenuItem,
  CardHeader,
  Grid,
  FlexBoxDirection: {
    Column: 'column',
    Row: 'row',
  },
  FlexBoxJustifyContent: {
    SpaceBetween: 'space-between',
    Center: 'center',
    Start: 'start',
    End: 'end',
    SpaceAround: 'SpaceAround',
  },
  FlexBoxAlignItems: {
    Center: 'center',
    Start: 'start',
    End: 'end',
    Stretch: 'stretch',
  },
  FlexBoxWrap: {
    Wrap: 'wrap',
    NoWrap: 'nowrap',
  },
};
