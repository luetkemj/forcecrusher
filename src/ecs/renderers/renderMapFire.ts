import { RendererContext } from "../systems/render.system";

export const renderMapFire = ({ views, world }: RendererContext) => {
  const view = views.mapFire;
  if (view) {
    view.clearView();

    const onFireQuery = world.with("onFire", "position");

    for (const entity of onFireQuery) {
      if (entity.inFov) {
        const { x, y } = entity.position;

        view?.updateCell({
          0: {
            char: "fire",
            tint: 0xfac000,
            tileSet: "kenny",
            x,
            y,
            alpha: 0.75,
          },
        });
      }
    }
  }
};
