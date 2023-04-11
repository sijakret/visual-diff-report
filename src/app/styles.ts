import { css } from "lit";

export const item = css`
  .item:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  .item.selected {
    border: 1px solid rgba(0, 0, 0, 0.6);
  }
  .menu .item.selected::before {
    content: ">";
    position: absolute;
    right: calc(100%);
    top: 0px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    background: black;
    color: white;
    border-radius: 4px 0px 0px 4px;
    width: 20px;
  }
  .item {
    position: relative;
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
  .item span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
