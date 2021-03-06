import eventBus, {EventsEnum, EventBus, ScopesEnum} from './modules/eventBus';
import router, {Router} from './modules/router';

/**
 * Class that responses for singleplayer
 *
 * @export
 * @class Offline
 */
export default class Offline implements Application.App {
  private rootElement: HTMLElement;
  private router: Router;
  private bus: EventBus;
  private urlRoot: string;

  /**
   * Creates an instance of Offline.
   * @param {HTMLElement} parentElement element for rendering game.
   * @memberof Offline
   */
  constructor(parentElement: HTMLElement) {
    this.rootElement = parentElement;
    this.router = router;
    this.bus = eventBus;
    this.urlRoot = '/offline/';

    this.bus.on(ScopesEnum.offline, EventsEnum.map_chosen, (data) => {
      // todo
    });
  }

  start() {
    this.router.go(this.urlRoot);
  }

  stop() {

  }

  pause() {

  }

  resume() {

  }
}
