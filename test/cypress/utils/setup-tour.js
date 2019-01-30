import defaultSteps from './default-steps';

/**
 * Setup a tour
 * @param {Shepherd} Shepherd The Shepherd instance
 * @param {Object} globalDefaults A hash of the `defaultStepOptions`
 * @param {[Object]} customSteps An array of the steps to add to the tour
 */
export default function(Shepherd, globalDefaults, customSteps, tourOpts = {}) {
  const defaultStepOptions = Object.assign({}, {
    showCancelLink: true
  }, globalDefaults);

  let shepherd = new Shepherd.Tour(Object.assign({defaultStepOptions}, tourOpts));

  const steps = typeof customSteps === 'function' ? customSteps(shepherd) : defaultSteps(shepherd);

  steps.forEach((step) => {
    const { id, options } = step;
    shepherd.addStep(id, options);
  });

  return shepherd;
}
