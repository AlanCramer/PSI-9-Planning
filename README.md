# PSI-9-Planning

__New Visualization: Linear Chart__
  * Standalone html for inovation exploration
  * Wrap in Directive
  * ![Chart Image](images/LinearChart.png)
  
__New Toolbar (used by Leader Central)__
  * Buttons driven by new TLSP api
  * ![Toolbar Image](images/toolbar.png)

__Report Infrastructure__
  * 4 New Report Services (used by Leader Central)
  * 4 New Report Directives (used by Leader Central)
  * Integrate with Nav Bar (support Jay Letto)
  * Drill Down Support

__Intellify Learning__
  * Review how current streams work
  * Build our own stream for future PSI (get horse in front of cart)

__Support Stage C WA__
  * New set of content and ids

__[Table Model Refactor](#table-model-refactor)__
  * Goal : simplify html of table
  * Goal : enable table consumer to access rows, columns, cells easier (more detail needed here)
  * Goal (?) : generalize hover behavior
  * Potential Strategy : Classes - e.g. "tableModel.getColumns()"  

__Common/Shared Report Service__
  * Goal : reduce code duplication
    - InsertLineBreaks
    - Initialize Intellify
    - resolveLowSkillTies
    - (there are more here ...)

__Service Caching__
  * cache data per class and session
  * E3D gets all data up front for dropdown ...

__Responsive D3 Visualizations__
  * Spike an example and let POs play with it
  * Visualization svg should respond to window resize

__CSS/LESS Overhaul__
  * less files per report
  * common report css file

__Bugs__

__New Visualization : Multiple Vertical Bar Chart__

__Simulator Redirect__
  * Goal : Make it clearer and cleaner to redirect to any desired server
    - support full name
    - support x for regex(0*) e.g. h502x1 or h502x11
  
__Unit testing__
  * make one useful unit test
  * make ten useful unit tests
   
## Table Model Refactor

### Requirements / Specifications
- [ ] A table has three general sections: header, body, and footer.
  - [ ] Each of these areas can contain zero to many rows.
  - [ ] All rows should contain the same number of elements. (?)
- [ ] Each table cell should be a valid object describing: the data it contains, cell-specific styling/behavior, and/or cell metadata.
  - [ ] `value`: The data itself. Required.
  - [ ] `rowIndex`: The index of the row the cell belongs to. Can be derived if not provided.
  - [ ] `columnIndex`: The index of the column the cell belongs to. Can be derived if not provided.
  - [ ] `cssClass` or `style`: Styling specific to the individual cell. Optional.
- [ ] A row is an ordered collection of valid table cells.
  - [ ] `index`: The index of the row within the table.
  - [ ] `sectionIndex`: The index of the row within its section (header, body, footer). (?)
  - [ ] `name`: A string identifier for the row. Optional.
- [ ] A column is also an ordered collection of valid table cells. However, while a row will only ever belong
to a single section, a column spans across all sections.
  - [ ] `index`: The index of the column within the table.
  - [ ] `name`: A string identifier for the column. Optional.
- [ ] CSS classes can be applied to the table at various levels of granularity:
  - [ ] Global (All cells in the table)
  - [ ] By section (All cells within the header / body / footer)
  - [ ] By row (All cells within the row)
  - [ ] By column (All cells within the column)
  - [ ] Cell-specific (Styling specific to only a single cell)
- [ ] A table with no data at all should be supported.

### Methods
| Name | Description |
| ----------- | ------- |
| `getRows()` | Returns the entire table, grouped by row |
| `getColumns()` | Returns the entire table, grouped by column |
| `getRow(index | name)` | Returns the row represented by the input - either by index, or if the row has a `name` property, by name |
| `getColumn(index | name)` | Similar to `getRow` |
| `setRow(index | name, newRow)` | Overwrites the specified row with a new table row |
| `setColumn(index | name, newColumn)` | Similar to `setRow` |
| `getHeader()` | Returns the rows within the header |
| `getBody()` | Returns the rows within the body |
| `getFooter()` | Returns the rows within the footer |
