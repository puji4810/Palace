/**
 * Settings → General → "Palace 界面" row.
 *
 * `settings.general.item` is the additive seat for one preference row; the row
 * draws its own internals and writes through our local options store. Values
 * persist in localStorage and apply as `html[data-palace-*]` attributes.
 */
function mountSettings({ RT, h, React, register }) {
  const { useEffect, useState } = React;

  const SEGMENTS = [
    {
      id: 'density',
      label: '密度',
      options: [
        { value: 'comfortable', label: '舒适' },
        { value: 'compact', label: '紧凑' },
      ],
    },
    {
      id: 'radius',
      label: '圆角',
      options: [
        { value: 'soft', label: '柔和' },
        { value: 'crisp', label: '紧凑' },
      ],
    },
    {
      id: 'motion',
      label: '动效',
      options: [
        { value: 'system', label: '跟随系统' },
        { value: 'reduced', label: '减弱' },
      ],
    },
  ];

  function PalaceSettingsRow() {
    const [options, setOptions] = useState(() => (RT ? { ...RT.options } : {}));
    useEffect(() => {
      if (!RT) return undefined;
      return RT.subscribe(() => setOptions({ ...RT.options }));
    }, []);

    return h(
      'div',
      { className: 'pui-setting-row', 'data-palace-settings': '' },
      h(
        'div',
        { className: 'pui-setting-row__body' },
        h(
          'div',
          { className: 'pui-setting-row__title' },
          h('span', { className: 'pui-setting-row__mark' }, puiIcon('sparkles', 14)),
          h('span', null, 'Palace 界面'),
          h('span', { className: 'pui-setting-row__badge' }, 'UI'),
        ),
        h(
          'div',
          { className: 'pui-setting-row__desc' },
          '界面密度、圆角风格与非必要动效。偏好保存在本机浏览器，不会同步到服务端。',
        ),
      ),
      h(
        'div',
        { className: 'pui-setting-row__controls' },
        SEGMENTS.map((segment) =>
          h(
            'div',
            { className: 'pui-segment', key: segment.id, role: 'group', 'aria-label': segment.label },
            h('span', { className: 'pui-segment__label' }, segment.label),
            h(
              'div',
              { className: 'pui-segment__track', role: 'radiogroup', 'aria-label': segment.label },
              segment.options.map((option) =>
                h(
                  'button',
                  {
                    key: option.value,
                    type: 'button',
                    role: 'radio',
                    'aria-checked': options[segment.id] === option.value ? 'true' : 'false',
                    className:
                      options[segment.id] === option.value
                        ? 'pui-segment__option pui-segment__option--on'
                        : 'pui-segment__option',
                    onClick: () => {
                      if (!RT) return;
                      RT.setOption(segment.id, option.value);
                      setOptions({ ...RT.options });
                    },
                  },
                  option.label,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  register('settings.general.item', { id: 'palace-ui', order: 50 }, PalaceSettingsRow);
}
