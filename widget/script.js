define(['jquery'], function ($) {
  var CustomWidget = function () {
    var self = this;
    var WORKER_URL = 'https://lali-dify-bot.lizethcontreras8.workers.dev';

    this.callbacks = {
      render: function () {
        return true;
      },

      init: function () {
        return true;
      },

      bind_actions: function () {
        return true;
      },

      settings: function () {
        return true;
      },

      dpSettings: function () {
        return true;
      },

      onSave: function () {
        return true;
      },

      destroy: function () {
        // Cleanup if needed
      },

      salesbotDesignerSettings: function (renderRow, params) {
        var exits = [
          { code: 'success', title: 'Success' },
          { code: 'fail', title: 'Fail' }
        ];

        return { exits: exits };
      },

      onSalesbotDesignerSave: function (handler_code, params) {
        var request_data = {
          message: params.text || '{{message_text}}'
        };

        return JSON.stringify([
          {
            question: [
              {
                handler: 'widget_request',
                params: {
                  url: WORKER_URL,
                  data: request_data
                }
              },
              {
                handler: 'goto',
                params: {
                  type: 'question',
                  step: 1
                }
              }
            ]
          },
          {
            question: [
              {
                handler: 'conditions',
                params: {
                  logic: 'and',
                  conditions: [
                    {
                      term1: '{{json.response}}',
                      term2: '',
                      operation: '!='
                    }
                  ],
                  result: [
                    {
                      handler: 'show',
                      params: {
                        value: '{{json.response}}'
                      }
                    },
                    {
                      handler: 'exits',
                      params: {
                        value: 'success'
                      }
                    }
                  ]
                }
              },
              {
                handler: 'exits',
                params: {
                  value: 'fail'
                }
              }
            ]
          }
        ]);
      }
    };

    return this;
  };

  return CustomWidget;
});
