import { css } from 'lit';

export const item = css`
  .item:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  .item.selected {
    border: 1px solid rgba(0, 0, 0, 0.4);
  }
  .item {
    transition: box-shadow 0.2s ease-in;
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 4px;
    align-items: center;
    white-space: nowrap;
    display: flex;
    cursor: pointer;
    margin: 4px;
    padding: 2px;
  }
`;
