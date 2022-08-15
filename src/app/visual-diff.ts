import { html, css, LitElement, TemplateResult, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { VisualDiffImage } from "../shared";
import { item } from "./styles";

@customElement("visual-diff")
export class VisualDiff extends LitElement {
  static styles = [
    item,
    css`
      :host {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        align-items: center;
      }
      img {
        max-width: 100%;
        max-height: 100%;
      }
      .menu {
        display: flex;
        width: 100%;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      .hidden {
        opacity: 0.2;
      }
      .n-a {
        margin: auto;
        opacity: 0.2;
        font-size: 60px;
      }
      .item {
        background: none;
      }
      .item.selected {
        background: rgba(0, 0, 0, 0.05);
      }
      .image-container {
        display: flex;
        overflow: hidden;
      }
      .wrap-image {
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      }
      .image-label {
        flex: 1 0;
        font-size: 14px;
        border-radius: 20px;
        text-align: right;
        padding-left: 8px;
        padding-right: 8px;
        background: rgba(255, 255, 255, 0.5);
      }
      .wrap-image:hover .image-label {
        display: initial;
      }
    `,
  ];

  @property() image?: VisualDiffImage;
  @property() tab: number = 0;

  @state() cycle: number = 1;
  @state() dimensions: string = "?x?";

  timer: any;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopCycle();
  }

  updated(changed: PropertyValueMap<any>): void {
    if (changed.has("tab")) {
      this.tabs()[this.tab].before();
    }
  }

  render() {
    return html`${this.renderTab()}`;
  }

  startCycle() {
    this.timer = setInterval(() => {
      this.cycle = (this.cycle + 1) % 2;
    }, 300);
  }

  stopCycle() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  tabs() {
    return [
      {
        title: "Baseline",
        render: this.renderImage(this.image?.baseline),
        before: () => this.stopCycle(),
        show: () => !!this.image?.baseline,
      },
      {
        title: "Current",
        render: this.renderImage(this.image?.current),
        before: () => this.stopCycle(),
        show: () => !!this.image?.current,
      },
      {
        title: "Diff",
        render: this.renderImage(this.image?.diff),
        before: () => this.stopCycle(),
        show: () => !!this.image?.diff,
      },
      {
        title: "Cycle A/B",
        render: () => this.renderCycle(),
        before: () => this.startCycle(),
        show: () => !!this.image?.diff,
      },
    ];
  }

  renderTab() {
    return this.tabs()[this.tab].render();
  }

  renderImage(image?: string) {
    return () =>
      html`<div class="menu">
          ${this.renderMenu()}
          <div class="image-label">
            ${image}<br />
            <i>${this.dimensions}</i>
          </div>
        </div>
        ${image
          ? html` <div class="image-container">
              <img
                src=${image}
                @load=${({ path }: { path: HTMLImageElement[] }) => {
                  const img = path[0];
                  this.dimensions = `${img.naturalWidth} x ${img.naturalHeight}px`;
                }}
              />
            </div>`
          : html`<div class="n-a">not available</div>`} `;
  }

  renderMenu(): TemplateResult[] {
    return this.tabs().map(
      ({ title, show }, index) =>
        html`<button
          class=${classMap({
            item: true,
            hidden: !show(),
            selected: this.tab === index,
          })}
          @click=${() => {
            this.tab = index;
            this.dispatchEvent(
              new CustomEvent("tab-changed", {
                detail: index,
                composed: true,
                bubbles: true,
              })
            );
          }}
        >
          ${title}
        </button>`
    );
  }
  renderCycle() {
    return this.renderImage(
      [this.image?.baseline, this.image?.current, this.image?.diff][this.cycle]
    )();
  }
}
